import Accept from "@hapi/accept";
import { BadRequestException, Controller, Get, Param, Query, Request, Response } from "@nestjs/common";
import bytes from "bytes";
import { IsBoolean, IsEnum, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { createHash } from "crypto";
import { type FastifyReply, type FastifyRequest } from "fastify";
import { type ReadStream } from "fs";
import sharp, { type FitEnum, type FormatEnum } from "sharp";
import { CacheService } from "../cache/cache.service.js";
import { StorageService } from "../storage/storage.service.js";
import { ImageService, type ProxyableImage } from "./image.service.js";
import { basename } from "path";

const FIT = ["cover", "contain", "fill", "inside", "outside"] as (keyof FitEnum)[];
// Image formats that can be animated by sharp
const ANIMATED_FORMATS = new Set(["image/gif", "image/webp", "image/apng"]);
const IMAGE_TYPES = new Map<string, keyof FormatEnum>([
  ["image/webp", "webp"],
  ["image/png", "png"],
  ["image/jpeg", "jpeg"],
  ["image/avif", "avif"],
  ["image/gif", "gif"],
]);

const IMAGE_MIMES_BY_PRIORITY = [
  // webp is relatively fast to encode and gives the best results, and supports transparency
  "image/webp",
  // jpeg is fast to encode and compact
  "image/jpeg",
  // png is big but supports transparency
  "image/png",
  // avif is fantastic but extremely slow to encode, so its the worst option.
  "image/avif",
  "image/gif",
];

class ImageProxyQuery {
  @IsIn(IMAGE_MIMES_BY_PRIORITY)
  @IsString()
  @IsOptional()
  format?: string;

  @IsEnum(FIT)
  @IsString()
  @IsOptional()
  fit?: keyof FitEnum;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsBoolean()
  @IsOptional()
  thumbnail?: boolean;
}

@Controller()
export class ImageController {
  private static readonly FORCE_PROCESS_SIZE = bytes("1MB");
  constructor(
    private imageService: ImageService,
    private storageService: StorageService,
    private cache: CacheService,
  ) {}

  @Get("/files/:fileId/imgproxy/:data")
  async imageProxy(
    @Param("fileId") fileId: string,
    @Param("data") data: string,
    @Query() query: ImageProxyQuery,
    @Request() req: FastifyRequest,
    @Response({ passthrough: false }) reply: FastifyReply,
  ) {
    const image = this.imageService.parseImageProxyPayload(data);
    const shouldProcess = this.shouldProcess(query, image);
    const { formatMime, formatKey } = this.detectBestMimeType(query, image, req, shouldProcess);

    const fileName = basename(image.path);
    const cleanFileName = encodeURIComponent(fileName);

    let contentDisposition: string | undefined;
    let stream: sharp.Sharp | ReadStream;
    let cacheStatus = "BYPASS";

    const extension = IMAGE_TYPES.get(formatMime)!;
    if (shouldProcess || formatMime !== image.mimeType) {
      const suffix = query.height || query.width ? "resized" : "processed";
      contentDisposition = `inline; filename="${cleanFileName}_${suffix}.${extension}"`;

      const cacheKey = this.getCacheKey(data, query);
      const cachedStream = await this.cache.createReadStream(cacheKey);

      if (cachedStream) {
        stream = cachedStream;
        cacheStatus = "HIT";
      } else {
        cacheStatus = "MISS";
        const transformer = sharp({ animated: !query.thumbnail, failOn: "none" }).toFormat(formatKey, {
          progressive: true,

          quality: 80,
        });

        if (query.height || query.width) {
          transformer.resize(query.width, query.height, { fit: query.fit, withoutEnlargement: true });
        }

        const fileStream = await this.storageService.createReadStreamHttp({ id: fileId, path: image.path });
        const cacheStream = this.cache.createWriteStream(cacheKey);
        const transformerStream = fileStream.pipe(transformer);
        transformerStream.pipe(cacheStream);
        stream = transformerStream;
      }
    } else {
      stream = await this.storageService.createReadStreamHttp({ id: fileId, path: image.path });
      contentDisposition = `inline; filename="${cleanFileName}.${extension}"`;
      if (image.size) {
        reply.header("Content-Length", image.size);
      }
    }

    return reply
      .headers({
        "cache-control": "public, max-age=31536000",
        "content-type": formatMime,
        "content-disposition": contentDisposition,
        "x-marver-original-type": image.mimeType?.toString(),
        "x-marver-cache": cacheStatus,
      })
      .send(stream);
  }

  private getCacheKey(data: string, query: ImageProxyQuery) {
    const hash = createHash("sha256");
    hash.update(data);
    hash.update(JSON.stringify(query));
    return hash.digest("hex");
  }

  /**
   * Finds the ideal mime type for the image based on the "Accept" header the browser sends
   * @example the browser doesn't support webp, but does support avif, this will return "avif"
   */
  private detectBestMimeType(
    query: ImageProxyQuery,
    file: ProxyableImage,
    req: FastifyRequest,
    isProcessing: boolean,
  ) {
    if (!file.mimeType) throw new BadRequestException("File is not an image");
    if (query.format) {
      return {
        formatMime: query.format,
        formatKey: IMAGE_TYPES.get(query.format)!,
      };
    }

    const acceptedMediaTypes = Accept.mediaTypes(req.headers.accept);
    const doesAcceptAll = acceptedMediaTypes.includes("*/*");

    const preferredFormats = IMAGE_MIMES_BY_PRIORITY.filter((mime) => {
      // if the soruce is animated, we can only send it as an animated format
      if (file.isAnimated && !ANIMATED_FORMATS.has(mime)) {
        return false;
      }

      // if the browser does not support this format, we can't send it
      if (!doesAcceptAll && !acceptedMediaTypes.includes(mime)) {
        return false;
      }

      // gifs are a bad format, they are only included so we don't always convert gifs to webp
      // if the image isnt animated, we ignore the gif format
      // if the image will be processed, we ignore the gif format
      if (mime === "image/gif" && (!file.isAnimated || isProcessing)) {
        return false;
      }

      return true;
    });

    if (!isProcessing && preferredFormats.includes(file.mimeType)) {
      // if possible, we'll send the image as the original format, which
      // saves on unnecessary processing time.
      return {
        formatMime: file.mimeType,
        formatKey: IMAGE_TYPES.get(file.mimeType)!,
      };
    }

    if (preferredFormats[0]) {
      return {
        formatMime: preferredFormats[0],
        formatKey: IMAGE_TYPES.get(preferredFormats[0])!,
      };
    }

    // if we can't find a format that the browser supports and we support, we're out of luck
    throw new BadRequestException("Your browser does not support any of the image formats we support");
  }

  /**
   * Determines if the image should be run through sharp or not
   * Also modifies the query object to remove params that are unnecessary or invalid
   * @example the height is larger than the image and the type is the same, we don't need to process it
   */
  private shouldProcess(query: ImageProxyQuery, file: ProxyableImage) {
    if (file.size && file.size > ImageController.FORCE_PROCESS_SIZE) {
      // always force processing on large files, because they're probably just
      // unoptimized garbage and we don't want to waste bandwidth.
      return true;
    }

    if (query.thumbnail && file.isAnimated) {
      return true;
    }

    if (query.width) {
      if (!file.width) return true;
      if (query.width < file.width) {
        // resizing to smaller so we have to process
        return true;
      } else {
        // if other query params are set and we still end up processing,
        // we don't want to resize to larger than the original size
        query.width = undefined;
      }
    }

    if (query.height) {
      if (!file.height) return true;
      if (query.height < file.height) {
        return true;
      } else {
        query.height = undefined;
      }
    }

    return false;
  }
}
