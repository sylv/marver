import { EntityManager, EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import bytes from 'bytes';
import { rgbaToThumbHash } from 'thumbhash-node';
import { IMAGE_EXTENSIONS } from '../../constants.js';
import { embeddingToBuffer } from '../../helpers/embedding.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { MediaTextEntity } from '../media/entities/media-text.entity.js';
import { Queue } from '../queue/queue.decorator.js';
import { RehoboamService } from '../rehoboam/rehoboam.service.js';
import { ImageService } from './image.service.js';

@Injectable()
export class ImageTasks {
  @InjectRepository(MediaTextEntity) private mediaTextRepo: EntityRepository<MediaTextEntity>;

  constructor(
    private imageService: ImageService,
    private rehoboamService: RehoboamService,
    private em: EntityManager,
  ) {}

  @Queue('IMAGE_EXTRACT_EXIF', {
    targetConcurrency: 4,
    thirdPartyDependant: false,
    fileFilter: {
      media: {
        height: { $ne: null },
        exifData: null,
      },
      extension: {
        $in: ['jog', 'tif', 'png', 'webp'],
      },
      info: {
        size: {
          $lte: bytes('50mb'), // very large images can be fucky to process
        },
      },
    },
  })
  async extractExif(file: FileEntity) {
    const media = file.media!;
    const exif = await this.imageService.createExifFromFile(media);
    await this.em.persistAndFlush(exif);
  }

  @Queue('CREATE_IMAGE_MEDIA', {
    targetConcurrency: 4,
    thirdPartyDependant: false,
    fileFilter: {
      extension: { $in: [...IMAGE_EXTENSIONS] },
      media: null,
      info: {
        size: { $lte: bytes('100mb') },
      },
    },
  })
  async extractMetadata(file: FileEntity) {
    const { resizedSize, originalMeta, rgba } = await this.imageService.loadImageAndConvertToRgba(
      file.path,
    );

    const media = this.imageService.createMediaFromSharpMetadata(originalMeta, file);
    const hash = rgbaToThumbHash(resizedSize.width, resizedSize.height, rgba);
    media.preview = Buffer.from(hash);
    await this.em.persistAndFlush(media);
  }

  @Queue('IMAGE_GENERATE_CLIP_EMBEDDING', {
    targetConcurrency: 1,
    thirdPartyDependant: true,
    fileFilter: {
      media: {
        height: { $ne: null },
        embedding: null,
      },
      extension: {
        $in: [...IMAGE_EXTENSIONS],
      },
      info: {
        size: { $lte: bytes('10mb') },
      },
    },
  })
  async generateClipEmbeddings(file: FileEntity) {
    const media = file.media!;
    // todo: handle solomon being offline, if we throw an error
    // here the task will be retried at a later point which means
    // a delay when the service is probably just restarting or updating.
    const embedding = await this.rehoboamService.encodeImage(media.file);
    media.embedding = embeddingToBuffer(embedding);
    await this.em.persistAndFlush(media);
  }

  // @Queue('IMAGE_EXTRACT_TEXT', {
  //   targetConcurrency: 4,
  //   thirdPartyDependant: true,
  //   fileFilter: {
  //     media: {
  //       hasText: null,
  //       height: { $ne: null },
  //       texts: {
  //         $exists: false,
  //       },
  //     },
  //     extension: {
  //       $in: [...IMAGE_EXTENSIONS],
  //     },
  //     info: {
  //       size: { $lte: bytes('10mb') },
  //     },
  //   },
  // })
  // async extractText(file: FileEntity) {
  //   const media = file.media!;
  //   const results = await this.rehoboamService.getOCR(media.file);

  //   media.hasText = !!results[0];
  //   this.em.persist(media);

  //   for (const result of results) {
  //     if (!result.bounding_box) throw new Error('No bounding box');
  //     const text = this.mediaTextRepo.create({
  //       media: media,
  //       boundingBox: result.bounding_box,
  //       confidence: result.confidence,
  //       text: result.text,
  //       type: MediaTextType.OCR,
  //     });

  //     this.em.persist(text);
  //   }

  //   await this.em.flush();
  // }

  // @Queue(TaskType.ImageGeneratePerceptualHash, {
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
