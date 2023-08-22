import { EntityManager, EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import bytes from 'bytes';
import { rgbaToThumbHash } from 'thumbhash-node';
import { IMAGE_EXTENSIONS } from '../../constants.js';
import { File } from '../file/entities/file.entity.js';
import { MediaText, MediaTextType } from '../media/entities/media-text.entity.js';
import { MediaVector } from '../media/entities/media-vector.entity.js';
import { SolomonService } from '../solomon/solomon.service.js';
import { Task } from '../tasks/task.decorator.js';
import { TaskType } from '../tasks/task.enum.js';
import { ImageService } from './image.service.js';

@Injectable()
export class ImageTasks {
  @InjectRepository(MediaVector) private mediaVectorRepo: EntityRepository<MediaVector>;
  @InjectRepository(MediaText) private mediaTextRepo: EntityRepository<MediaText>;

  constructor(
    private imageService: ImageService,
    private solomonService: SolomonService,
    private em: EntityManager,
  ) {}

  @Task(TaskType.ImageExtractExif, {
    concurrency: 4,
    filter: {
      media: {
        height: { $ne: null },
        exifMetadata: null,
      },
      extension: {
        $in: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      },
      metadata: {
        size: {
          $gte: bytes('500kb'), // very small images probably wont have exif data
          $lte: bytes('50mb'), // very large images can be fucky to process
        },
      },
    },
  })
  async extractExif(file: File) {
    const media = file.media!;
    const exif = await this.imageService.createExifFromFile(media);
    await this.em.persistAndFlush(exif);
  }

  @Task(TaskType.ImageExtractMetadata, {
    concurrency: 4,
    filter: {
      extension: { $in: [...IMAGE_EXTENSIONS] },
      media: null,
      metadata: {
        size: { $lte: bytes('100mb') },
      },
    },
  })
  async extractMetadata(file: File) {
    const { resizedSize, originalMeta, rgba } = await this.imageService.loadImageAndConvertToRgba(file.path);
    const media = this.imageService.createMediaFromSharpMetadata(originalMeta, file);
    const hash = rgbaToThumbHash(resizedSize.width, resizedSize.height, rgba);
    media.preview = Buffer.from(hash);
    await this.em.persistAndFlush(media);
  }

  @Task(TaskType.ImageGenerateClipVectors, {
    concurrency: 4,
    filter: {
      media: {
        height: { $ne: null },
        vectors: {
          $exists: false,
        },
      },
      extension: {
        $in: [...IMAGE_EXTENSIONS],
      },
      metadata: {
        size: { $lte: bytes('10mb') },
      },
    },
  })
  async generateClipVectors(file: File) {
    const media = file.media!;
    // todo: handle solomon being offline, if we throw an error
    // here the task will be retried at a later point which means
    // a delay when the service is probably just restarting or updating.
    const vector = await this.solomonService.getFileVector(media.file);
    const mediaVec = this.mediaVectorRepo.create({
      media: file.media!,
      data: this.solomonService.vectorToBuffer(vector),
    });

    await this.em.persistAndFlush(mediaVec);
  }

  @Task(TaskType.ImageExtractText, {
    concurrency: 4,
    filter: {
      media: {
        hasText: null,
        height: { $ne: null },
        texts: {
          $exists: false,
        },
      },
      extension: {
        $in: [...IMAGE_EXTENSIONS],
      },
      metadata: {
        size: { $lte: bytes('10mb') },
      },
    },
  })
  async extractText(file: File) {
    const media = file.media!;
    const results = await this.solomonService.getOCR(media.file);

    media.hasText = !!results[0];
    this.em.persist(media);

    for (const result of results) {
      if (!result.bounding_box) throw new Error('No bounding box');
      const text = this.mediaTextRepo.create({
        media: media,
        boundingBox: result.bounding_box,
        confidence: result.confidence,
        text: result.text,
        type: MediaTextType.OCR,
      });

      this.em.persist(text);
    }

    await this.em.flush();
  }

  // @Task(TaskType.ImageGeneratePerceptualHash, {
  //   concurrency: 2,
  //   filter: {
  //     file: {
  //       size: { $lte: bytes('10mb') },
  //       extension: { $in: [...IMAGE_EXTENSIONS] },
  //     },
  //     hash: {
  //       sha256: { $ne: null },
  //       perceptual: null,
  //     },
  //   },
  // })
  // async generatePerceptualHash(file: File) {
  //   try {
  //     const perceptualHash = await phashImage(file.path, { hashSize: 16 });
  //     file.hash!.perceptual = perceptualHash;
  //     await this.em.persistAndFlush(file);
  //   } catch (error: any) {
  //     // todo: this triggers on things that are definitely valid images.
  //     if (error.message.includes('error decoding')) throw new CorruptedFileError(file.path);
  //     throw error;
  //   }
  // }
}
