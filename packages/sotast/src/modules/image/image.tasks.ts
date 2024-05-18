import { EntityManager, EntityRepository, ref } from "@mikro-orm/better-sqlite";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import bytes from "bytes";
import { IMAGE_EXTENSIONS } from "../../constants.js";
import { embeddingToBuffer } from "../../helpers/embedding.js";
import { CLIPService } from "../clip/clip.service.js";
import { FileEmbeddingEntity } from "../file/entities/file-embedding.entity.js";
import { FileEntity } from "../file/entities/file.entity.js";
import { Queue } from "../queue/queue.decorator.js";
import { ImageService } from "./image.service.js";
import sharp from "sharp";
import { generatePreview } from "../../helpers/generatePreview.js";

@Injectable()
export class ImageTasks {
  @InjectRepository(FileEmbeddingEntity) embeddingRepo: EntityRepository<FileEmbeddingEntity>;

  constructor(
    private imageService: ImageService,
    private clipService: CLIPService,
    private em: EntityManager,
  ) {}

  @Queue("IMAGE_EXTRACT_EXIF", {
    targetConcurrency: 4,
    fileFilter: {
      exifData: null,
      info: {
        height: { $ne: null },
      },
      size: {
        $lte: bytes("50mb"),
      },
    },
  })
  async extractExif(file: FileEntity) {
    const exif = await this.imageService.createExifFromFile(file);
    if (exif) {
      if (exif.dateTime) {
        file.createdAt = exif.dateTime;
        this.em.persist(file);
      }

      this.em.persist(exif);
      await this.em.flush();
    }
  }

  @Queue("INGEST_IMAGE", {
    targetConcurrency: 4,
    fileFilter: {
      extension: { $in: [...IMAGE_EXTENSIONS] },
      size: { $lte: bytes("100mb") },
      info: {
        height: null,
        width: null,
        isAnimated: null,
      },
    },
  })
  async extractMetadata(file: FileEntity) {
    const image = sharp(file.path);
    const metadata = await image.metadata();

    const thumbnailTiny = await generatePreview(file.path);
    file.thumbnailTiny = ref(Buffer.from(thumbnailTiny));

    file.info.height = metadata.height;
    file.info.width = metadata.width;

    const isAnimated = metadata.pages ? metadata.pages > 0 : !!metadata.delay;
    file.info.isAnimated = isAnimated;
    if (Array.isArray(metadata.delay)) {
      const durationSeconds = metadata.delay.reduce((acc, delay) => {
        // most browsers have a minimum delay of 0.05s-ish
        // we have to account for that to have accurate times
        // source: https://stackoverflow.com/questions/21791012
        const delaySeconds = delay / 1000;
        if (delaySeconds < 0.05) return acc + 0.1;
        return acc + delaySeconds;
      }, 0);

      file.info.durationSeconds = durationSeconds;
      file.info.framerate = metadata.delay.length / durationSeconds;
    } else if (metadata.delay && metadata.pages) {
      file.info.durationSeconds = (metadata.delay * metadata.pages) / 1000;
      file.info.framerate = metadata.pages / file.info.durationSeconds;
    }

    await this.em.persistAndFlush(file);
  }

  @Queue("IMAGE_GENERATE_EMBEDDING", {
    targetConcurrency: 1,
    batchSize: 50,
    fileFilter: {
      info: { height: { $ne: null } },
      size: { $lte: bytes("10mb") },
      extension: {
        $in: [...IMAGE_EXTENSIONS],
      },
    },
  })
  async generateClipEmbeddings(files: FileEntity[]) {
    const embedding = await this.clipService.encodeImageBatch(files.map((file) => file.path));
    for (const [i, element] of embedding.entries()) {
      const file = files[i];
      const embedding = this.embeddingRepo.create({
        data: embeddingToBuffer(element),
        file: file,
      });

      this.em.persist(embedding);
    }

    await this.em.flush();
  }

  // @Queue('IMAGE_EXTRACT_TEXT', {
  //   targetConcurrency: 4,
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
