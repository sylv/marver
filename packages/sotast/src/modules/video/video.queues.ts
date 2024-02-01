import { phashVideo, type MergedFrame } from '@marver/ephyra';
import { EntityManager, EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { mkdir, rm, writeFile } from 'fs/promises';
import ms from 'ms';
import { join } from 'path';
import type { OutputInfo } from 'sharp';
import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash-node';
import { VIDEO_EXTENSIONS } from '../../constants.js';
import { embeddingToBuffer } from '../../helpers/embedding.js';
import { FfmpegService } from '../ffmpeg/ffmpeg.service.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { ImageService } from '../image/image.service.js';
import { MediaPosterEntity } from '../media/entities/media-poster.entity.js';
import { MediaThumbnailEntity } from '../media/entities/media-thumbnail.entity.js';
import { MediaTimelineEntity } from '../media/entities/media-timeline.entity.js';
import { MediaEntity } from '../media/entities/media.entity.js';
import { JobError } from '../queue/job.error.js';
import { Queue } from '../queue/queue.decorator.js';
import { RehoboamService } from '../rehoboam/rehoboam.service.js';

@Injectable()
export class VideoQueues {
  @InjectRepository(MediaEntity) private mediaRepo: EntityRepository<MediaEntity>;
  @InjectRepository(MediaThumbnailEntity)
  private fileThumbnailRepo: EntityRepository<MediaThumbnailEntity>;
  @InjectRepository(MediaTimelineEntity)
  private fileTimelineRepo: EntityRepository<MediaTimelineEntity>;
  @InjectRepository(MediaPosterEntity) private filePosterRepo: EntityRepository<MediaPosterEntity>;

  constructor(
    private ffmpegService: FfmpegService,
    private rehoboamService: RehoboamService,
    private imageService: ImageService,
    private em: EntityManager,
  ) {}

  @Queue('CREATE_VIDEO_MEDIA', {
    targetConcurrency: 4,
    thirdPartyDependant: false,
    fileFilter: {
      media: null,
      extension: {
        $in: [...VIDEO_EXTENSIONS],
      },
    },
  })
  async extractMetadata(file: FileEntity) {
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
    } else {
      metadata.hasEmbeddedSubtitles = false;
    }

    if (!hasStream) {
      throw new JobError('No video or audio streams found', { corruptFile: true });
    }

    await this.em.persistAndFlush(metadata);
  }

  @Queue('VIDEO_EXTRACT_SCREENSHOTS', {
    targetConcurrency: 3,
    thirdPartyDependant: false,
    fileFilter: {
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
    cleanupMethod: async (result: Awaited<ReturnType<VideoQueues['extractScreenshots']>>) => {
      await rm(result.screenshotPath, { recursive: true, force: true });
    },
  })
  async extractScreenshots(file: FileEntity) {
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

  @Queue('VIDEO_GENERATE_CLIP_EMBEDDING', {
    parentType: 'VIDEO_EXTRACT_SCREENSHOTS',
    targetConcurrency: 1,
    thirdPartyDependant: true,
  })
  async generateClipVector(
    file: FileEntity,
    { frames }: Awaited<ReturnType<VideoQueues['extractScreenshots']>>,
  ) {
    const media = file.media!;
    const embeddings = [];
    for (const frame of frames) {
      if (!frame.path) continue;
      const embedding = await this.rehoboamService.encodeImage({ path: frame.path });
      embeddings.push(embedding);
    }

    // todo: figure out how to do this without huge quality loss
    // const merged = await this.solomonService.mergeEmbeddings(embeddings);
    media.embedding = embeddingToBuffer(embeddings[0]);
    await this.em.persistAndFlush(media);
  }

  @Queue('VIDEO_GENERATE_TIMELINE', {
    parentType: 'VIDEO_EXTRACT_SCREENSHOTS',
    targetConcurrency: 1,
    thirdPartyDependant: false,
    fileFilter: {
      media: {
        timeline: null,
      },
    },
  })
  async generateTimeline(
    file: FileEntity,
    { frames }: Awaited<ReturnType<VideoQueues['extractScreenshots']>>,
  ) {
    const media = file.media!;
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

  @Queue('VIDEO_PICK_THUMBNAIL', {
    parentType: 'VIDEO_EXTRACT_SCREENSHOTS',
    targetConcurrency: 1,
    thirdPartyDependant: false,
    fileFilter: {
      media: {
        thumbnail: null,
      },
    },
  })
  async pickThumbnail(
    file: FileEntity,
    { frames }: Awaited<ReturnType<VideoQueues['extractScreenshots']>>,
  ) {
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

  @Queue('VIDEO_PICK_POSTER', {
    parentType: 'VIDEO_EXTRACT_SCREENSHOTS',
    targetConcurrency: 1,
    thirdPartyDependant: false,
    fileFilter: {
      media: {
        poster: null,
      },
    },
  })
  async pickPoster(
    file: FileEntity,
    { frames }: Awaited<ReturnType<VideoQueues['extractScreenshots']>>,
  ) {
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

  @Queue('VIDEO_GENERATE_PHASH', {
    targetConcurrency: 2,
    thirdPartyDependant: false,
    populate: ['media', 'media.poster'],
    fileFilter: {
      media: {
        preview: null,
        poster: { $ne: null },
        height: { $ne: null },
        width: { $ne: null },
      },
    },
  })
  async generateThumbhash(file: FileEntity) {
    const media = file.media!;
    if (!media.poster) throw new Error('Missing poster');
    const poster = media.poster.getEntity();
    const { resizedSize, rgba } = await this.imageService.loadImageAndConvertToRgba(poster.path);
    const hash = rgbaToThumbHash(resizedSize.width, resizedSize.height, rgba);
    media.preview = Buffer.from(hash);
    await this.em.persistAndFlush(media);
  }
}
