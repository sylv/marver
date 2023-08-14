import { MergedFrame, phashVideo } from '@marver/vidhash';
import { EntityManager, EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { mkdir, rm, writeFile } from 'fs/promises';
import ms from 'ms';
import { join } from 'path';
import sharp, { OutputInfo } from 'sharp';
import { rgbaToThumbHash } from 'thumbhash-node';
import { VIDEO_EXTENSIONS } from '../../constants.js';
import { CorruptedFileError } from '../../errors/CorruptedFileError.js';
import { FfmpegService } from '../ffmpeg/ffmpeg.service.js';
import { File } from '../file/entities/file.entity.js';
import { ImageService } from '../image/image.service.js';
import { MediaPoster } from '../media/entities/media-poster.entity.js';
import { MediaThumbnail } from '../media/entities/media-thumbnail.entity.js';
import { MediaTimeline } from '../media/entities/media-timeline.entity.js';
import { MediaVector } from '../media/entities/media-vector.entity.js';
import { Media } from '../media/entities/media.entity.js';
import { SentryService } from '../sentry/sentry.service.js';
import { TaskChild } from '../tasks/task-child.decorator.js';
import { Task, TaskParent } from '../tasks/task.decorator.js';
import { TaskType } from '../tasks/task.enum.js';

@Injectable()
export class VideoTasks {
  @InjectRepository(Media) private mediaRepo: EntityRepository<Media>;
  @InjectRepository(MediaVector) private mediaVectorRepo: EntityRepository<MediaVector>;
  @InjectRepository(MediaThumbnail) private fileThumbnailRepo: EntityRepository<MediaThumbnail>;
  @InjectRepository(MediaTimeline) private fileTimelineRepo: EntityRepository<MediaTimeline>;
  @InjectRepository(MediaPoster) private filePosterRepo: EntityRepository<MediaPoster>;

  constructor(
    private ffmpegService: FfmpegService,
    private sentryService: SentryService,
    private imageService: ImageService,
    private em: EntityManager
  ) {}

  @Task(TaskType.VideoExtractMetadata, {
    concurrency: 4,
    filter: {
      media: null,
      extension: {
        $in: [...VIDEO_EXTENSIONS],
      },
    },
  })
  async extractMetadata(file: File) {
    const result = await this.ffmpegService.ffprobe(file.path);
    const videoStream = result.streams.find((stream) => stream.codec_type === 'video');
    const audioStream = result.streams.find((stream) => stream.codec_type === 'audio');
    const subtitleStream = result.streams.find((stream) => stream.codec_type === 'subtitle');
    const metadata = this.mediaRepo.create({
      file: file,
    });

    let hasStream = false;
    if (videoStream) {
      hasStream = true;
      metadata.height = videoStream.height;
      metadata.width = videoStream.width;
      metadata.videoCodec = videoStream.codec_name;
      if (videoStream.duration) metadata.durationSeconds = +videoStream.duration;
      if (videoStream.bit_rate) metadata.bitrate = +videoStream.bit_rate;
      if (videoStream.r_frame_rate) {
        const [num, den] = videoStream.r_frame_rate.split('/');
        if (num && den) {
          metadata.framerate = +num / +den;
        }
      }
    }

    if (audioStream) {
      hasStream = true;
      metadata.audioCodec = audioStream.codec_name;
      metadata.audioChannels = audioStream.channels;
    }

    if (subtitleStream) {
      metadata.hasEmbeddedSubtitles = true;
      metadata.nonVerbal = false;
    }

    if (!hasStream) {
      throw new CorruptedFileError(file.path);
    }

    await this.em.persistAndFlush(metadata);
  }

  @TaskParent(TaskType.VideoExtractScreenshots, {
    concurrency: 3,
    filter: {
      media: {
        videoCodec: { $ne: null },
        durationSeconds: {
          $lte: ms('1h') / 1000,
        },
      },
      extension: {
        $in: [...VIDEO_EXTENSIONS],
      },
    },
    cleanupMethod: async (result: Awaited<ReturnType<VideoTasks['extractScreenshots']>>) => {
      await rm(result.screenshotPath, { recursive: true, force: true });
    },
  })
  async extractScreenshots(file: File) {
    const media = file.media!;
    const screenshotPath = join(media.file.metadataFolder, 'screenshots');
    await mkdir(screenshotPath, { recursive: true });
    const frames = await phashVideo(media.file.path, {
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

  @TaskChild(TaskType.VideoGenerateClipVector, {
    parentType: TaskType.VideoExtractScreenshots,
    concurrency: 1,
    filter: {
      media: {
        vectors: {
          $exists: false,
        },
      },
      extension: {
        $in: [...VIDEO_EXTENSIONS],
      },
    },
  })
  async generateClipVector(
    file: File,
    { frames }: Awaited<ReturnType<VideoTasks['extractScreenshots']>>
  ) {
    const media = file.media!;
    for (const frame of frames) {
      if (!frame.path) continue;
      const vector = await this.sentryService.getFileVector({ path: frame.path });
      const mediaVector = this.mediaVectorRepo.create({
        media: media,
        data: this.sentryService.vectorToBuffer(vector),
      });

      this.em.persist(mediaVector);
    }

    await this.em.flush();
  }

  @TaskChild(TaskType.VideoGenerateTimeline, {
    parentType: TaskType.VideoExtractScreenshots,
    concurrency: 1,
    filter: {
      media: {
        timeline: null,
      },
      extension: {
        $in: [...VIDEO_EXTENSIONS],
      },
    },
  })
  async generateTimeline(file: File, { frames }: Awaited<ReturnType<VideoTasks['extractScreenshots']>>) {
    const media = file.media!;
    const framesWithPaths = frames.filter((frame) => frame.path);
    const layers = [];
    let layerIndex = 0;
    let height = 100;
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

    const timelinePreviewPath = join(media.file.metadataFolder, 'timeline.webp');
    const compositeWidth = width! * layerIndex;
    const composite = sharp({
      create: {
        width: compositeWidth,
        height: height,
        background: '#000000',
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
      mimeType = 'image/jpeg';
    } else {
      outputInfo = await composite.webp({ quality: 60 }).toFile(timelinePreviewPath);
      mimeType = 'image/webp';
    }

    const timeline = this.fileTimelineRepo.create({
      media: media,
      path: timelinePreviewPath,
      width: outputInfo.width,
      height: outputInfo.height,
      mimeType: mimeType,
    });

    await this.em.persistAndFlush(timeline);
  }

  @TaskChild(TaskType.VideoPickThumbnail, {
    parentType: TaskType.VideoExtractScreenshots,
    concurrency: 1,
    filter: {
      media: {
        thumbnail: null,
      },
      extension: {
        $in: [...VIDEO_EXTENSIONS],
      },
    },
  })
  async pickThumbnail(file: File, { frames }: Awaited<ReturnType<VideoTasks['extractScreenshots']>>) {
    const media = file.media!;
    const firstFrameWithPath = frames.find((frame) => frame.path);
    if (!firstFrameWithPath) {
      throw new Error('Expected at least one frame to been written to disk');
    }

    const metadata = await sharp(firstFrameWithPath.path).metadata();
    const thumbnail = this.fileThumbnailRepo.create({
      media: media,
      width: metadata.width!,
      height: metadata.height!,
      mimeType: 'image/webp',
    });

    const meta = await sharp(firstFrameWithPath.path)
      .resize(1280, 720, { fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(thumbnail.path);

    thumbnail.width = meta.width;
    thumbnail.height = meta.height;
    await this.em.persistAndFlush(thumbnail);
  }

  @TaskChild(TaskType.VideoPickPoster, {
    parentType: TaskType.VideoExtractScreenshots,
    concurrency: 1,
    filter: {
      media: {
        poster: null,
      },
      extension: {
        $in: [...VIDEO_EXTENSIONS],
      },
    },
  })
  async pickPoster(file: File, { frames }: Awaited<ReturnType<VideoTasks['extractScreenshots']>>) {
    const media = file.media!;
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
        .resize(1280, 720, { fit: 'inside' })
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
        media: media,
        width: largestFrame.info.width,
        height: largestFrame.info.height,
        mimeType: 'image/webp',
        generated: true,
        fromMs: largestFrame.frame.fromMs,
      });

      await writeFile(poster.path, largestFrame.data);
      media.preview = undefined;
      this.em.persist(poster);
      this.em.persist(media);
      await this.em.flush();
    }
  }

  @Task(TaskType.VideoGenerateThumbhash, {
    concurrency: 2,
    populate: ['media', 'media.poster'],
    filter: {
      media: {
        preview: null,
        poster: { $ne: null },
        height: { $ne: null },
        width: { $ne: null },
      },
    },
  })
  async generateThumbhash(file: File) {
    const media = file.media!;
    if (!media.poster) throw new Error('Missing poster');
    const poster = media.poster.getEntity();
    const { resizedSize, rgba } = await this.imageService.loadImageAndConvertToRgba(poster.path);
    const hash = rgbaToThumbHash(resizedSize.width, resizedSize.height, rgba);
    media.preview = Buffer.from(hash);
    await this.em.persistAndFlush(media);
  }
}
