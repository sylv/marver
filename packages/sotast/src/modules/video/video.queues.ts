import { EntityManager, EntityRepository, ref } from "@mikro-orm/better-sqlite";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, Logger } from "@nestjs/common";
import { probeFile } from "@ryanke/video-probe";
import chunkify from "chunkify";
import { link, mkdir, rm, writeFile } from "fs/promises";
import { dirname, join } from "path";
import sharp from "sharp";
import { config } from "../../config.js";
import { VIDEO_EXTENSIONS } from "../../constants.js";
import { embeddingToBuffer } from "../../helpers/embedding.js";
import { cosineSimilarity } from "../../helpers/similarity.js";
import { CLIPService } from "../clip/clip.service.js";
import { FileAssetEntity, FileAssetType } from "../file/entities/file-asset.entity.js";
import { FileEmbeddingEntity } from "../file/entities/file-embedding.entity.js";
import { FileEntity } from "../file/entities/file.entity.js";
import { JobError } from "../queue/job.error.js";
import { Queue } from "../queue/queue.decorator.js";
import { iterateVideo, type Frame } from "@ryanke/video-iterate";

type FrameWithPath = Omit<Frame, "data"> & { path: string; size: number };

@Injectable()
export class VideoQueues {
  @InjectRepository(FileAssetEntity) private assetRepo: EntityRepository<FileAssetEntity>;
  @InjectRepository(FileEmbeddingEntity) private fileEmbeddingRepo: EntityRepository<FileEmbeddingEntity>;
  private log = new Logger(VideoQueues.name);

  constructor(
    private clipService: CLIPService,
    private em: EntityManager,
  ) {}

  @Queue("INGEST_VIDEO", {
    targetConcurrency: 4,
    fileFilter: {
      extension: {
        $in: [...VIDEO_EXTENSIONS],
      },
    },
  })
  async extractMetadata(file: FileEntity) {
    const { video_stream, audio_streams, subtitle_streams } = await probeFile(file.path);

    if (video_stream) {
      file.info.height = video_stream.height;
      file.info.width = video_stream.width;
      file.info.framerate = video_stream.fps;
      if (video_stream.codec) file.info.videoCodec = video_stream.codec;
      if (video_stream.bitrate) file.info.bitrate = video_stream.bitrate;
      if (video_stream.duration_s) file.info.durationSeconds = video_stream.duration_s;
    }

    if (audio_streams[0]) {
      file.info.audioCodec = audio_streams[0].codec || undefined;
      file.info.audioChannels = audio_streams[0].channels;
    }

    if (subtitle_streams[0]) {
      file.info.hasEmbeddedSubtitles = true;
      file.info.nonVerbal = false;
    } else {
      file.info.hasEmbeddedSubtitles = false;
    }

    if (!audio_streams[0] && !video_stream) {
      throw new JobError("No video or audio streams found", { corruptFile: true });
    }

    await this.em.persistAndFlush(file);
  }

  @Queue("VIDEO_EXTRACT_SCREENSHOTS", {
    targetConcurrency: 4,
    fileFilter: {
      info: {
        videoCodec: { $ne: null },
        durationSeconds: {
          $ne: null,
        },
      },
      extension: {
        $in: [...VIDEO_EXTENSIONS],
      },
    },
    cleanupMethod: async (result: Awaited<ReturnType<VideoQueues["extractScreenshots"]>>) => {
      await rm(result.screenshotDir, { recursive: true, force: true });
    },
  })
  async extractScreenshots(file: FileEntity) {
    const screenshotDir = join(config.metadata_dir, "screenshots", file.id);
    await mkdir(screenshotDir, { recursive: true });

    const frames = iterateVideo(file.path, {
      // mergeFrames: true,
      // hashSize: 16,
      intervalSecs: 10,
      inputDurationSecs: file.info.durationSeconds!,
      frameFormat: "webp",
    });

    const framesWithPaths: FrameWithPath[] = [];
    for await (const frame of frames) {
      const framePath = join(screenshotDir, `${frame.positionSecs}.webp`);
      await writeFile(framePath, frame.data);
      framesWithPaths.push({
        positionSecs: frame.positionSecs,
        path: framePath,
        size: frame.data.length,
      });
    }

    // todo: file perceptual hash storage was removed during media refactoring
    return {
      frames: framesWithPaths,
      screenshotDir,
    };
  }

  @Queue("VIDEO_GENERATE_EMBEDDING", {
    parentType: "VIDEO_EXTRACT_SCREENSHOTS",
    targetConcurrency: 1,
  })
  async generateClipVector(
    file: FileEntity,
    { frames }: Awaited<ReturnType<VideoQueues["extractScreenshots"]>>,
  ) {
    const framePaths: string[] = [];
    const frameToPosition = new Map<string, number>();
    for (const frame of frames) {
      if (!frame.path) continue;
      framePaths.push(frame.path);
      frameToPosition.set(frame.path, frame.positionSecs);
    }

    for (const batch of chunkify(framePaths, 50)) {
      const embeddings = await this.clipService.encodeImageBatch(batch);
      let previous: number[] | undefined = undefined;

      for (let i = 0; i < embeddings.length; i++) {
        const embedding = embeddings[i];
        const framePath = batch[i];
        if (previous) {
          const similarity = cosineSimilarity(previous, embedding);
          if (similarity > 0.9) {
            this.log.debug(`Skipping frame embedding because its too similar (${similarity}) (${file.id})`);
            continue;
          }
        }

        previous = embedding;
        this.fileEmbeddingRepo.create({
          data: embeddingToBuffer(embedding),
          file: file,
          position: frameToPosition.get(framePath)! * 1000,
        });
      }

      await this.em.flush();
    }
  }

  @Queue("VIDEO_PICK_THUMBNAIL", {
    parentType: "VIDEO_EXTRACT_SCREENSHOTS",
    targetConcurrency: 4,
    fileFilter: {
      thumbnail: null,
    },
  })
  async pickThumbnail(file: FileEntity, { frames }: Awaited<ReturnType<VideoQueues["extractScreenshots"]>>) {
    // generate a poster by finding the largest (aka, hopefully most detailed) frame.
    // this approach should ignore things like intros/outros that are mostly black.
    let largestFrame: FrameWithPath | null = null;
    for (const frame of frames) {
      if (!frame.path) continue;
      if (frame.positionSecs > 600) {
        // for long videos, we dont want to check too deep for perf and for potential spoilers.
        break;
      }

      if (!largestFrame || frame.size > largestFrame.size) {
        largestFrame = frame;
      }
    }

    if (largestFrame) {
      const metadata = await sharp(largestFrame.path).metadata();
      const thumbnail = this.assetRepo.create({
        file: file,
        assetType: FileAssetType.Thumbnail,
        width: metadata.width,
        height: metadata.height,
        mimeType: "image/webp",
        generated: true,
        position: largestFrame.positionSecs * 1000,
      });

      const thumbnailPath = thumbnail.getPath();

      await mkdir(dirname(thumbnailPath), { recursive: true });
      await link(largestFrame.path, thumbnailPath);

      file.thumbnail = ref(thumbnail);

      const tiny = await sharp(largestFrame.path).resize(32, 32).webp({ quality: 5 }).toBuffer();
      file.thumbnailTiny = ref(Buffer.from(tiny));

      this.em.persist([thumbnail, file]);
      await this.em.flush();
    }
  }
}
