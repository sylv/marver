import { EntityManager, EntityRepository } from "@mikro-orm/better-sqlite";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { phashVideo, type MergedFrame } from "@ryanke/ephyra";
import { mkdir, rm, writeFile } from "fs/promises";
import ms from "ms";
import { dirname, join } from "path";
import type { OutputInfo } from "sharp";
import sharp from "sharp";
import { config } from "../../config.js";
import { VIDEO_EXTENSIONS } from "../../constants.js";
import { embeddingToBuffer } from "../../helpers/embedding.js";
import { CLIPService } from "../clip/clip.service.js";
import { FfmpegService } from "../ffmpeg/ffmpeg.service.js";
import { FileAssetEntity, FileAssetType } from "../file/entities/file-asset.entity.js";
import { FileEmbeddingEntity } from "../file/entities/file-embedding.entity.js";
import { FileEntity } from "../file/entities/file.entity.js";
import { JobError } from "../queue/job.error.js";
import { Queue } from "../queue/queue.decorator.js";

@Injectable()
export class VideoQueues {
  @InjectRepository(FileAssetEntity) private assetRepo: EntityRepository<FileAssetEntity>;
  @InjectRepository(FileEmbeddingEntity) private fileEmbeddingRepo: EntityRepository<FileEmbeddingEntity>;

  constructor(
    private ffmpegService: FfmpegService,
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
    const result = await this.ffmpegService.ffprobe(file.path);
    const videoStream = result.streams.find((stream) => stream.codec_type === "video");
    const audioStream = result.streams.find((stream) => stream.codec_type === "audio");
    const subtitleStream = result.streams.find((stream) => stream.codec_type === "subtitle");

    let hasStream = false;
    if (videoStream) {
      hasStream = true;
      file.info.height = videoStream.height;
      file.info.width = videoStream.width;
      file.info.videoCodec = videoStream.codec_name;
      if (videoStream.duration) file.info.durationSeconds = +videoStream.duration;
      if (videoStream.bit_rate) file.info.bitrate = +videoStream.bit_rate;
      if (videoStream.r_frame_rate) {
        const [num, den] = videoStream.r_frame_rate.split("/");
        if (num && den) {
          file.info.framerate = +num / +den;
        }
      }
    }

    if (audioStream) {
      hasStream = true;
      file.info.audioCodec = audioStream.codec_name;
      file.info.audioChannels = audioStream.channels;
    }

    if (subtitleStream) {
      file.info.hasEmbeddedSubtitles = true;
      file.info.nonVerbal = false;
    } else {
      file.info.hasEmbeddedSubtitles = false;
    }

    if (!hasStream) {
      throw new JobError("No video or audio streams found", { corruptFile: true });
    }

    await this.em.persistAndFlush(file);
  }

  @Queue("VIDEO_EXTRACT_SCREENSHOTS", {
    targetConcurrency: 3,
    fileFilter: {
      info: {
        videoCodec: { $ne: null },
        durationSeconds: {
          $lte: ms("1h") / 1000,
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
    const frames = await phashVideo(file.path, {
      mergeFrames: true,
      hashSize: 16,
      writeFrames: {
        // since we're generating thumbnails we can't limit the depth,
        // which also means unfortunately that we're generating a shit load of images.
        depthSecs: undefined,
        intervalMs: 10000,
        outputDir: screenshotDir,
      },
      hashFrames: {
        intervalMs: 250,
        depthSecs: 600,
      },
    });

    // todo: file perceptual hash storage was removed during media refactoring
    return {
      frames,
      screenshotDir,
    };
  }

  @Queue("VIDEO_GENERATE_CLIP_EMBEDDING", {
    parentType: "VIDEO_EXTRACT_SCREENSHOTS",
    targetConcurrency: 1,
  })
  async generateClipVector(
    file: FileEntity,
    { frames }: Awaited<ReturnType<VideoQueues["extractScreenshots"]>>,
  ) {
    const framePaths: string[] = [];
    for (const frame of frames) {
      if (!frame.path) continue;
      framePaths.push(frame.path);
    }

    // todo: batch into ~100 images at once
    const embeddings = await this.clipService.encodeImageBatch(framePaths);
    for (const embedding of embeddings) {
      this.fileEmbeddingRepo.create(
        {
          data: embeddingToBuffer(embedding),
          file: file,
        },
        { persist: true },
      );
    }

    await this.em.flush();
  }

  @Queue("VIDEO_PICK_THUMBNAIL", {
    parentType: "VIDEO_EXTRACT_SCREENSHOTS",
    targetConcurrency: 1,
    fileFilter: {
      thumbnail: null,
    },
  })
  async pickThumbnail(file: FileEntity, { frames }: Awaited<ReturnType<VideoQueues["extractScreenshots"]>>) {
    const firstFrameWithPath = frames.find((frame) => frame.path);
    if (!firstFrameWithPath) {
      throw new Error("Expected at least one frame to been written to disk");
    }

    const thumbnail = this.assetRepo.create({
      file: file,
      generated: true,
      width: file.info.width!,
      height: file.info.height!,
      mimeType: "image/webp",
      assetType: FileAssetType.Thumbnail,
    });

    const thumbnailPath = thumbnail.getPath();
    await mkdir(dirname(thumbnailPath), { recursive: true });
    const meta = await sharp(firstFrameWithPath.path)
      .resize(1280, 720, { fit: "inside" })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);

    thumbnail.width = meta.width;
    thumbnail.height = meta.height;
    await this.em.persistAndFlush(thumbnail);
  }

  @Queue("VIDEO_PICK_POSTER", {
    parentType: "VIDEO_EXTRACT_SCREENSHOTS",
    targetConcurrency: 1,
    fileFilter: {
      poster: null,
      info: {
        durationSeconds: {
          $gte: 120,
        },
      },
    },
  })
  async pickPoster(file: FileEntity, { frames }: Awaited<ReturnType<VideoQueues["extractScreenshots"]>>) {
    // generate a poster by finding the largest (aka, hopefully most detailed) frame.
    // this approach should ignore things like intros/outros that are mostly black.
    let largestFrame: { frame: MergedFrame; data: Buffer; info: OutputInfo } | null = null;
    let largestFrameSize: number | null = null;
    for (const frame of frames) {
      // todo: this is a slow process because if we don't reencode the image, the size
      // can vary a lot. for example the first frame is always almost double the size
      // of the others, which i think might be to do with keyframes. so whatever,
      // for now this works.
      if (!frame.path) continue;
      const result = await sharp(frame.path)
        .resize(1280, 720, { fit: "inside" })
        .webp({ quality: 80 })
        .toBuffer({ resolveWithObject: true });

      if (!largestFrame || result.info.size! > largestFrameSize!) {
        largestFrameSize = result.info.size!;
        largestFrame = {
          frame: frame,
          data: result.data,
          info: result.info,
        };
      }
    }

    if (largestFrame) {
      const poster = this.assetRepo.create({
        file: file,
        assetType: FileAssetType.Poster,
        width: largestFrame.info.width,
        height: largestFrame.info.height,
        mimeType: "image/webp",
        generated: true,
        position: largestFrame.frame.fromMs,
      });

      await mkdir(dirname(poster.getPath()), { recursive: true });
      await writeFile(poster.getPath(), largestFrame.data);
      file.preview = undefined;
      this.em.persist(poster);
      this.em.persist(file);
      await this.em.flush();
    }
  }
}
