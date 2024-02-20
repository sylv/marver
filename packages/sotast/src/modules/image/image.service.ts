import { EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import avro from 'avsc';
import ExifReader from 'exifreader';
import sharp from 'sharp';
import { IMAGE_EXTENSIONS } from '../../constants.js';
import { FileExifDataEntity } from '../file/entities/file-exif.entity.js';
import { type FileEntity } from '../file/entities/file.entity.js';

export interface ProxyableImage {
  fileName: string;
  path: string;
  height?: number;
  width?: number;
  size: number | null;
  mimeType?: string | null;
  isAnimated?: boolean;
}

const proxyableImageSchema = avro.Type.forSchema({
  type: 'record',
  name: 'ProxyableImage',
  fields: [
    { name: 'fileName', type: 'string' },
    { name: 'path', type: 'string' },
    { name: 'height', type: ['null', 'int'] },
    { name: 'width', type: ['null', 'int'] },
    { name: 'size', type: ['null', 'long'] },
    { name: 'mimeType', type: ['null', 'string'] },
    { name: 'isAnimated', type: 'boolean' },
  ],
});

@Injectable()
export class ImageService {
  private static readonly EXIF_DATE_FORMAT = /(?<year>\d{4}):(?<month>\d{2}):(?<day>\d{2})/;
  @InjectRepository(FileExifDataEntity) private exifRepo: EntityRepository<FileExifDataEntity>;
  private log = new Logger(ImageService.name);

  parseImageProxyPayload(payload: string): ProxyableImage {
    const buffer = Buffer.from(payload, 'base64url');
    try {
      return proxyableImageSchema.fromBuffer(buffer);
    } catch (error: any) {
      if (error.message.includes('truncated')) {
        throw new BadRequestException('Invalid image proxy payload');
      }

      throw error;
    }
  }

  createImageProxyUrl(fileId: string, image: ProxyableImage) {
    const payload = proxyableImageSchema.toBuffer(image);
    return `/api/files/${fileId}/imgproxy/${payload.toString('base64url')}`;
  }

  createMediaProxyUrl(file: FileEntity) {
    if (file.unavailable) return null;
    if (file.extension && IMAGE_EXTENSIONS.has(file.extension)) {
      return this.createImageProxyUrl(file.id, {
        fileName: file.name,
        mimeType: file.mimeType,
        path: file.path,
        size: file.size,
        height: file.info.height,
        width: file.info.width,
        isAnimated: file.info.isAnimated || file.mimeType === 'image/gif',
      });
    }

    if (file.poster) {
      const poster = file.poster.getEntity();
      return this.createImageProxyUrl(file.id, {
        fileName: `${file.name}_poster`,
        path: poster?.path,
        size: null,
        height: poster?.height,
        mimeType: poster?.mimeType,
        width: poster?.width,
        isAnimated: false,
      });
    }

    if (file.thumbnail) {
      const thumbnail = file.thumbnail.getEntity();
      return this.createImageProxyUrl(file.id, {
        fileName: `${file.name}_thumbnail`,
        path: thumbnail?.path,
        size: null,
        height: thumbnail?.height,
        mimeType: thumbnail?.mimeType,
        width: thumbnail?.width,
        isAnimated: false,
      });
    }

    return null;
  }

  async loadImageAndConvertToRgba(imagePath: string) {
    // in the past this was done using @napi-rs/canvas but with particularly large images,
    // it seems like it gives a segmentation fault. canvas is faster but sharp is more reliable.
    // canvas impl: https://github.com/evanw/thumbhash/issues/2#issuecomment-1481848612
    const maxSize = 100;
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const rgba = await image
      .resize({
        width: maxSize,
        height: maxSize,
        fit: 'inside',
      })
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    return {
      rgba: rgba.data,
      originalMeta: metadata,
      resizedSize: {
        height: rgba.info.height,
        width: rgba.info.width,
      },
    };
  }

  async createExifFromFile(file: FileEntity) {
    const exif = this.exifRepo.create({ file });
    try {
      const exifData = await ExifReader.load(file.path);

      if (exifData.LensMake) exif.lensMake = exifData.LensMake.description;
      if (exifData.LensModel) exif.lensModel = exifData.LensModel.description;
      if (exifData.Make) exif.cameraMake = exifData.Make.description;
      if (exifData.Model) exif.cameraModel = exifData.Model.description;
      if (exifData.FocalLength) exif.focalLength = exifData.FocalLength.description;
      if (exifData.ExposureTime) exif.exposureTime = exifData.ExposureTime.description;
      if (exifData.FNumber) exif.fNumber = exifData.FNumber.description;
      if (exifData.ISOSpeedRatings) exif.iso = +exifData.ISOSpeedRatings.description;
      if (exifData.Flash) exif.flash = exifData.Flash.description;
      if (exifData.DateTimeOriginal)
        exif.dateTime = this.parseExifDate(exifData.DateTimeOriginal.description);
      else if (exifData.DateTime) exif.dateTime = this.parseExifDate(exifData.DateTime.description);

      const location = this.getLatLongFromExif(exifData);
      if (location) {
        exif.latitude = location[0];
        exif.longitude = location[1];
      }
    } catch (error: any) {
      if (error.name !== 'MetadataMissingError') {
        throw error;
      }
    }

    return exif;
  }

  private getLatLongFromExif(exifData: ExifReader.Tags): [number, number] | null {
    // In Exif data, the full GPS information is split into two different tags for each direction: the coordinate value (GPSLatitude, GPSLongitude) and the reference value (GPSLatitudeRef, GPSLongitudeRef). Use the references to know whether the coordinate is north/south and east/west. Often you will see north and east represented as positive values, and south and west represented as negative values (e.g. in Google Maps). This setup is also used for the altitude using GPSAltitude and GPSAltitudeRef where the latter specifies if it's above sea level (positive) or below sea level (negative). If you don't want to calculate the final values yourself, see the section on GPS for pre-calculated ones.
    if (!exifData['GPSLatitude']) return null;
    if (!exifData['GPSLatitudeRef']) return null;
    if (!exifData['GPSLongitude']) return null;
    if (!exifData['GPSLongitudeRef']) return null;

    const lat = exifData['GPSLatitude'].description;
    const long = exifData['GPSLongitude'].description;
    const latRef = (exifData['GPSLatitudeRef'].value as string[])[0];
    if (latRef === 'S') return [Number.parseFloat(lat) * -1, Number.parseFloat(long)];
    return [Number.parseFloat(lat), Number.parseFloat(long)];
  }

  private parseExifDate(date: string) {
    // exif dates are in the format "YYYY:MM:DD HH:MM:SS", javascript cannot parse
    // that as a date without some trickery.
    const clean = date.replace(ImageService.EXIF_DATE_FORMAT, '$<year>-$<month>-$<day>');
    const parsed = new Date(clean);
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() === 0) {
      this.log.warn(`Failed to parse date "${date}" into a valid date object`);
      return undefined;
    }

    return parsed;
  }
}
