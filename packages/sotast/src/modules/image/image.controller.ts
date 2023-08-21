import Accept from '@hapi/accept';
import { BadRequestException, Controller, Get, Param, Query, Request, Response } from '@nestjs/common';
import bytes from 'bytes';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { type FastifyReply, type FastifyRequest } from 'fastify';
import { createReadStream, type ReadStream } from 'fs';
import sharp, { type FitEnum, type FormatEnum } from 'sharp';
import { ImageService, type ProxyableImage } from './image.service.js';

const FIT = ['cover', 'contain', 'fill', 'inside', 'outside'] as (keyof FitEnum)[];
// Image formats that can be animated by sharp
const ANIMATED_FORMATS = new Set(['image/gif', 'image/webp', 'image/apng']);
const IMAGE_TYPES = new Map<string, keyof FormatEnum>([
  ['image/webp', 'webp'],
  ['image/png', 'png'],
  ['image/jpeg', 'jpeg'],
  ['image/avif', 'avif'],
  ['image/gif', 'gif'],
]);

const IMAGE_MIMES_BY_PRIORITY = [
  // webp is relatively fast to encode and gives the best results, and supports transparency
  'image/webp',
  // jpeg is fast to encode and compact
  'image/jpeg',
  // png is big but supports transparency
  'image/png',
  // avif is fantastic but extremely slow to encode, so its the worst option.
  'image/avif',
  'image/gif',
];

export class ImageProxyQuery {
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
}

@Controller()
export class ImageController {
  private static readonly FORCE_PROCESS_SIZE = bytes('5MB');
  constructor(private imageService: ImageService) {}

  @Get('/files/:fileId/imgproxy/:data')
  async imageProxy(
    @Param('fileId') fileId: string,
    @Param('data') data: string,
    @Query() query: ImageProxyQuery,
    @Request() req: FastifyRequest,
    @Response({ passthrough: false }) reply: FastifyReply,
  ) {
    const image = this.imageService.parseImageProxyPayload(data);
    const { formatMime, formatKey } = await this.detectBestMimeType(query, image, req);
    const shouldProcess = this.shouldProcess(formatMime, query, image);
    const cleanFileName = encodeURIComponent(image.fileName);

    let stream: sharp.Sharp | ReadStream;
    let contentDisposition: string | undefined;
    const extension = IMAGE_TYPES.get(formatMime)!;
    if (shouldProcess) {
      const transformer = sharp({ animated: true }).toFormat(formatKey, {
        progressive: true,
        quality: 80,
      });

      let suffix = 'processed';
      if (query.height || query.width) {
        transformer.resize(query.width, query.height, { fit: query.fit });
        suffix = `resized`;
      }

      stream = createReadStream(image.path).pipe(transformer);
      contentDisposition = `inline; filename="${cleanFileName}_${suffix}.${extension}"`;
    } else {
      stream = createReadStream(image.path);
      contentDisposition = `inline; filename="${cleanFileName}.${extension}"`;
      if (image.size) {
        reply.header('Content-Length', image.size);
      }
    }

    return reply
      .headers({
        'Cache-Control': 'public, max-age=31536000',
        'Content-Type': formatMime,
        'Content-Disposition': contentDisposition,
        'X-Marver-Processed': shouldProcess,
        'X-Marver-Original-Size': image.size,
        'X-Marver-Original-Format': image.mimeType,
        'X-Marver-Original-Name': encodeURIComponent(image.fileName),
        'X-Marver-Path': encodeURIComponent(image.path),
      })
      .send(stream);
  }

  /**
   * Finds the ideal mime type for the image based on the "Accept" header the browser sends
   * @example the browser doesn't support webp, but does support avif, this will return "avif"
   */
  private async detectBestMimeType(query: ImageProxyQuery, file: ProxyableImage, req: FastifyRequest) {
    if (!file.mimeType) throw new BadRequestException('File is not an image');
    if (query.format) {
      return {
        formatMime: query.format,
        formatKey: IMAGE_TYPES.get(query.format)!,
      };
    }

    const acceptedMediaTypes = Accept.mediaTypes(req.headers.accept);
    const doesAcceptAll = acceptedMediaTypes.includes('*/*');

    const willBeForcedToProcess = file.size && file.size > ImageController.FORCE_PROCESS_SIZE;
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
      if (mime === 'image/gif' && (!file.isAnimated || willBeForcedToProcess)) {
        return false;
      }

      return true;
    });

    if (!willBeForcedToProcess && preferredFormats.includes(file.mimeType)) {
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
    throw new BadRequestException('Your browser does not support any of the image formats we support');
  }

  /**
   * Determines if the image should be run through sharp or not
   * Also modifies the query object to remove params that are unnecessary or invalid
   * @example the height is larger than the image and the type is the same, we don't need to process it
   */
  private shouldProcess(resolvedMimeType: string, query: ImageProxyQuery, file: ProxyableImage) {
    if (file.size && file.size > ImageController.FORCE_PROCESS_SIZE) {
      // always force processing on large files, because they're probably just
      // unoptimized garbage and we don't want to waste bandwidth.
      return true;
    }

    if (resolvedMimeType !== file.mimeType) {
      // if the type is different, we have to process
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
