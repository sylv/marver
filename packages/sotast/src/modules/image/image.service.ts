import { EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import ExifReader from 'exifreader';
import { pack, unpack } from 'msgpackr';
import sharp from 'sharp';
import { IMAGE_EXTENSIONS } from '../../constants.js';
import { File } from '../file/entities/file.entity.js';
import { MediaExifData } from '../media/entities/media-exif.entity.js';
import { Media } from '../media/entities/media.entity.js';

export class ProxyableImage {
  @IsString()
  fileName: string;

  @IsString()
  path: string;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  size: number | null;

  @IsOptional()
  mimeType?: string | null;

  @IsBoolean()
  isAnimated?: boolean;
}

@Injectable()
export class ImageService {
  private static readonly EXIF_DATE_FORMAT = /(?<year>[0-9]{4}):(?<month>[0-9]{2}):(?<day>[0-9]{2})/;
  @InjectRepository(MediaExifData) private exifRepo: EntityRepository<MediaExifData>;
  @InjectRepository(Media) private mediaRepo: EntityRepository<Media>;
  private logger = new Logger(ImageService.name);

  parseImageProxyPayload(payload: string): ProxyableImage {
    return unpack(Buffer.from(payload, 'base64url'));
  }

  createImageProxyUrl(fileId: string, image: ProxyableImage) {
    const payload = pack(image);
    return `/api/files/${fileId}/imgproxy/${payload.toString('base64url')}`;
  }

  createMediaProxyUrl(media: Media) {
    if (media.file.metadata.unavailable) return null;
    if (media.file.extension && IMAGE_EXTENSIONS.has(media.file.extension)) {
      return this.createImageProxyUrl(media.file.id, {
        fileName: media.file.name,
        mimeType: media.file.mimeType,
        path: media.file.path,
        size: media.file.metadata.size,
        height: media.height,
        width: media.width,
        isAnimated: media.isAnimated || media.file.mimeType === 'image/gif',
      });
    }

    if (media.poster) {
      const poster = media.poster.getEntity();
      return this.createImageProxyUrl(media.file.id, {
        fileName: `${media.file.name}_poster`,
        path: poster?.path,
        size: null,
        height: poster?.height,
        mimeType: poster?.mimeType,
        width: poster?.width,
        isAnimated: false,
      });
    }

    if (media.thumbnail) {
      const thumbnail = media.thumbnail.getEntity();
      return this.createImageProxyUrl(media.file.id, {
        fileName: `${media.file.name}_thumbnail`,
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

  createMediaFromSharpMetadata(data: sharp.Metadata, file: File) {
    const isAnimated = data.pages ? data.pages > 0 : !!data.delay;
    const meta = this.mediaRepo.create({
      height: data.height,
      width: data.width,
      file: file,
      isAnimated: isAnimated,
    });

    if (Array.isArray(data.delay)) {
      const durationSeconds = data.delay.reduce((acc, delay) => {
        // most browsers have a minimum delay of 0.05s-ish
        // we have to account for that to have accurate times
        // source: https://stackoverflow.com/questions/21791012
        const delaySeconds = delay / 1000;
        if (delaySeconds < 0.05) return acc + 0.1;
        return acc + delaySeconds;
      }, 0);

      meta.durationSeconds = durationSeconds;
      meta.framerate = data.delay.length / durationSeconds;
    } else if (data.delay && data.pages) {
      meta.durationSeconds = (data.delay * data.pages) / 1000;
      meta.framerate = data.pages / meta.durationSeconds;
    }

    return meta;
  }

  async createExifFromFile(media: Media) {
    const exif = this.exifRepo.create({ media });
    try {
      const exifData = await ExifReader.load(media.file.path);

      if (exifData.LensMake) exif.lensMake = exifData.LensMake.description;
      if (exifData.LensModel) exif.lensModel = exifData.LensModel.description;
      if (exifData.Make) exif.cameraMake = exifData.Make.description;
      if (exifData.Model) exif.cameraModel = exifData.Model.description;
      if (exifData.FocalLength) exif.focalLength = exifData.FocalLength.description;
      if (exifData.ExposureTime) exif.exposureTime = exifData.ExposureTime.description;
      if (exifData.FNumber) exif.fNumber = exifData.FNumber.description;
      if (exifData.ISOSpeedRatings) exif.iso = +exifData.ISOSpeedRatings.description;
      if (exifData.Flash) exif.flash = exifData.Flash.description;
      if (exifData.DateTimeOriginal) exif.dateTime = this.parseExifDate(exifData.DateTimeOriginal.description);
      else if (exifData.DateTime) exif.dateTime = this.parseExifDate(exifData.DateTime.description);

      const location = this.getLatLongFromExif(exifData);
      if (location) {
        exif.latitude = location[0];
        exif.longitude = location[1];
      }

      if (exif.dateTime) {
        media.file.metadata.createdAt = exif.dateTime;
        this.exifRepo.persist(media.file);
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
    if (latRef === 'S') return [parseFloat(lat) * -1, parseFloat(long)];
    return [parseFloat(lat), parseFloat(long)];
  }

  private parseExifDate(date: string) {
    // exif dates are in the format "YYYY:MM:DD HH:MM:SS", javascript cannot parse
    // that as a date without some trickery.
    const clean = date.replace(ImageService.EXIF_DATE_FORMAT, '$<year>-$<month>-$<day>');
    const parsed = new Date(clean);
    if (isNaN(parsed.getTime()) || parsed.getTime() === 0) {
      this.logger.warn(`Failed to parse date "${date}" into a valid date object`);
      return undefined;
    }

    return parsed;
  }
}
