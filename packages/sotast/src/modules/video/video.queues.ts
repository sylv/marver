import { phashVideo, type MergedFrame } from "@ryanke/ephyra";
import { EntityManager, EntityRepository } from "@mikro-orm/better-sqlite";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { mkdir, rm, writeFile } from "node:fs/promises";
import ms from "ms";
import { join } from "node:path";
import type { OutputInfo } from "sharp";
import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash-node";
import { VIDEO_EXTENSIONS } from "../../constants.js";
import { embeddingToBuffer } from "../../helpers/embedding.js";
import { CLIPService } from "../clip/clip.service.js";
import { FfmpegService } from "../ffmpeg/ffmpeg.service.js";
import { FilePosterEntity } from "../file/entities/assets/file-poster.entity.js";
import { FileThumbnailEntity } from "../file/entities/assets/file-thumbnail.entity.js";
import { FileTimelineEntity } from "../file/entities/assets/file-timeline.entity.js";
import { FileEntity } from "../file/entities/file.entity.js";
import { ImageService } from "../image/image.service.js";
import { JobError } from "../queue/job.error.js";
import { Queue } from "../queue/queue.decorator.js";
import { FileEmbeddingEntity } from "../file/entities/file-embedding.entity.js";

@Injectable()
export class VideoQueues {
  @InjectRepository(FileThumbnailEntity) private fileThumbnailRepo: EntityRepository<FileThumbnailEntity>;
  @InjectRepository(FileTimelineEntity) private fileTimelineRepo: EntityRepository<FileTimelineEntity>;
  @InjectRepository(FilePosterEntity) private filePosterRepo: EntityRepository<FilePosterEntity>;
  @InjectRepository(FileEmbeddingEntity) private fileEmbeddingRepo: EntityRepository<FileEmbeddingEntity>;

  constructor(
    private ffmpegService: FfmpegService,
    private clipService: CLIPService,
    private imageService: ImageService,
    private em: EntityManager,
  ) {}

  @Queue("CREATE_VIDEO_MEDIA", {
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
      await rm(result.screenshotPath, { recursive: true, force: true });
    },
  })
  async extractScreenshots(file: FileEntity) {
    const screenshotPath = join(file.assetFolder, "screenshots");
    await mkdir(screenshotPath, { recursive: true });
    const frames = await phashVideo(file.path, {
      mergeFrames: true,
      hashSize: 16,
      writeFrames: {
        // since we're generating thumbnails we can't limit the depth,
        // which also means unfortunately that we're generating a shit load of images.
        depthSecs: undefined,
        intervalMs: 10000,
        outputDir: screenshotPath,
      },
      hashFrames: {
        intervalMs: 250,
        depthSecs: 600,
      },
    });

    // todo: file perceptual hash storage was removed during media refactoring
    return {
      frames,
      screenshotPath,
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

  @Queue("VIDEO_GENERATE_TIMELINE", {
    parentType: "VIDEO_EXTRACT_SCREENSHOTS",
    targetConcurrency: 1,
    fileFilter: {
      timeline: null,
      info: {
        durationSeconds: {
          $gte: 180,
        },
      },
    },
  })
  async generateTimeline(
    file: FileEntity,
    { frames }: Awaited<ReturnType<VideoQueues["extractScreenshots"]>>,
  ) {
    const framesWithPaths = frames.filter((frame) => frame.path);
    const layers = [];
    let layerIndex = 0;
    const height = 100;
    let width: number | null = null;
    for (const frame of framesWithPaths) {
      const result: { data: Buffer; info: OutputInfo } = await sharp(frame.path)
        .resize(width, height)
        .webp({ quality: 80 })
        .toBuffer({ resolveWithObject: true });

      layers.push({
        input: result.data,
        top: 0,
        left: result.info.width! * layerIndex,
        width: result.info.width,
      });

      layerIndex++;
      width = result.info.width;
    }

    const timelinePreviewPath = join(file.assetFolder, "timeline.webp");
    const compositeWidth = width! * layerIndex;
    const composite = sharp({
      create: {
        width: compositeWidth,
        height: height,
        background: "#000000",
        channels: 4,
      },
    }).composite(layers);

    let outputInfo: OutputInfo;
    let mimeType: string;
    if (compositeWidth > 16383) {
      // webp has a max width and sometimes the timeline previews can go over that.
      // todo: a better approach would be to have multiple rows of images, which
      // may also help with compression.
      outputInfo = await composite.jpeg({ quality: 60 }).toFile(timelinePreviewPath);
      mimeType = "image/jpeg";
    } else {
      outputInfo = await composite.webp({ quality: 60 }).toFile(timelinePreviewPath);
      mimeType = "image/webp";
    }

    const timeline = this.fileTimelineRepo.create({
      file: file,
      path: timelinePreviewPath,
      width: outputInfo.width,
      height: outputInfo.height,
      mimeType: mimeType,
    });

    await this.em.persistAndFlush(timeline);
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

    const thumbnail = this.fileThumbnailRepo.create({
      file: file,
      width: file.info.width!,
      height: file.info.height!,
      mimeType: "image/webp",
    });

    const meta = await sharp(firstFrameWithPath.path)
      .resize(1280, 720, { fit: "inside" })
      .webp({ quality: 80 })
      .toFile(thumbnail.path);

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
      const poster = this.filePosterRepo.create({
        file: file,
        width: largestFrame.info.width,
        height: largestFrame.info.height,
        mimeType: "image/webp",
        generated: true,
        fromMs: largestFrame.frame.fromMs,
      });

      await writeFile(poster.path, largestFrame.data);
      file.preview = undefined;
      this.em.persist(poster);
      this.em.persist(file);
      await this.em.flush();
    }
  }

  @Queue("VIDEO_GENERATE_PHASH", {
    targetConcurrency: 2,
    populate: ["poster"],
    fileFilter: {
      poster: { $ne: null },
      preview: null,
      info: {
        height: { $ne: null },
        width: { $ne: null },
      },
    },
  })
  async generateThumbhash(file: FileEntity) {
    if (!file.poster) throw new Error("Missing poster");
    const poster = file.poster.getEntity();
    const { resizedSize, rgba } = await this.imageService.loadImageAndConvertToRgba(poster.path);
    const hash = rgbaToThumbHash(resizedSize.width, resizedSize.height, rgba);
    file.preview = Buffer.from(hash);
    await this.em.persistAndFlush(file);
  }
}
