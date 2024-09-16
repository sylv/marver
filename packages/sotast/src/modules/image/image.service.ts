import { EntityRepository } from "@mikro-orm/better-sqlite";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import avro from "avsc";
import ExifReader from "exifreader";
import { IMAGE_EXTENSIONS } from "../../constants.js";
import { FileExifDataEntity } from "../file/entities/file-exif.entity.js";
import { type FileEntity } from "../file/entities/file.entity.js";
import { parseExifDate } from "@ryanke/parsers/exif-date";

export interface ProxyableImage {
  path: string;
  height?: number;
  width?: number;
  size: number | null;
  mimeType?: string | null;
  isAnimated?: boolean;
}

const proxyableImageSchema = avro.Type.forSchema({
  type: "record",
  name: "ProxyableImage",
  fields: [
    { name: "path", type: "string" },
    { name: "height", type: ["null", "int"] },
    { name: "width", type: ["null", "int"] },
    { name: "size", type: ["null", "long"] },
    { name: "mimeType", type: ["null", "string"] },
    { name: "isAnimated", type: "boolean" },
  ],
});

@Injectable()
export class ImageService {
  @InjectRepository(FileExifDataEntity) private exifRepo: EntityRepository<FileExifDataEntity>;
  private log = new Logger(ImageService.name);

  parseImageProxyPayload(payload: string): ProxyableImage {
    const buffer = Buffer.from(payload, "base64url");
    try {
      return proxyableImageSchema.fromBuffer(buffer);
    } catch (error: any) {
      if (error.message.includes("truncated")) {
        throw new BadRequestException("Invalid image proxy payload");
      }

      throw error;
    }
  }

  createImageProxyUrl(fileId: string, image: ProxyableImage) {
    const payload = proxyableImageSchema.toBuffer(image);
    return `/api/files/${fileId}/imgproxy/${payload.toString("base64url")}`;
  }

  createMediaProxyUrl(file: FileEntity) {
    if (file.unavailable) return null;
    if (file.extension && IMAGE_EXTENSIONS.has(file.extension)) {
      return this.createImageProxyUrl(file.id, {
        mimeType: file.mimeType,
        path: file.path,
        size: file.size,
        height: file.info.height,
        width: file.info.width,
        isAnimated: file.info.isAnimated || file.mimeType === "image/gif",
      });
    }

    if (file.thumbnail) {
      const thumbnail = file.thumbnail.getEntity();
      return this.createImageProxyUrl(file.id, {
        path: thumbnail?.getPath(),
        size: null,
        height: thumbnail?.height,
        mimeType: thumbnail?.mimeType,
        width: thumbnail?.width,
        isAnimated: false,
      });
    }

    return null;
  }

  async createExifFromFile(file: FileEntity) {
    try {
      const exif = this.exifRepo.create({ file });
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

      const dateValue = exifData.DateTimeOriginal || exifData.DateTime;
      if (dateValue) {
        const result = parseExifDate(dateValue.description);
        if (result.error) {
          this.log.warn(`Could not parse "${dateValue.description}" as a valid exif date`);
        } else {
          exif.dateTime = result.date;
        }
      }

      const location = this.getLatLongFromExif(exifData);
      if (location) {
        exif.latitude = location[0];
        exif.longitude = location[1];
      }

      return exif;
    } catch (error: any) {
      if (error.name === "MetadataMissingError" || error.message === "Invalid image format") return null;
      throw error;
    }
  }

  private getLatLongFromExif(exifData: ExifReader.Tags): [number, number] | null {
    // In Exif data, the full GPS information is split into two different tags for each direction: the coordinate value (GPSLatitude, GPSLongitude) and the reference value (GPSLatitudeRef, GPSLongitudeRef). Use the references to know whether the coordinate is north/south and east/west. Often you will see north and east represented as positive values, and south and west represented as negative values (e.g. in Google Maps). This setup is also used for the altitude using GPSAltitude and GPSAltitudeRef where the latter specifies if it's above sea level (positive) or below sea level (negative). If you don't want to calculate the final values yourself, see the section on GPS for pre-calculated ones.
    if (!exifData["GPSLatitude"]) return null;
    if (!exifData["GPSLatitudeRef"]) return null;
    if (!exifData["GPSLongitude"]) return null;
    if (!exifData["GPSLongitudeRef"]) return null;

    const lat = exifData["GPSLatitude"].description;
    const long = exifData["GPSLongitude"].description;
    const latRef = (exifData["GPSLatitudeRef"].value as string[])[0];

    let latVal: number;
    let longVal: number;
    if (latRef === "S") {
      // return [Number.parseFloat(lat) * -1, Number.parseFloat(long)]
      latVal = Number.parseFloat(lat) * -1;
      longVal = Number.parseFloat(long);
    } else {
      latVal = Number.parseFloat(lat);
      longVal = Number.parseFloat(long);
    }

    if (Number.isNaN(latVal) || Number.isNaN(longVal)) return null;
    return [latVal, longVal];
  }
}
