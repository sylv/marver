import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { FfmpegModule } from '../ffmpeg/ffmpeg.module.js';
import { FileMetadata } from '../file/entities/file-metadata.embeddable.js';
import { MediaSubtitle } from '../media/entities/media-subtitle.entity.js';
import { File } from '../file/entities/file.entity.js';
import { SubtitleController } from './subtitle.controller.js';
import { SubtitleService } from './subtitle.service.js';
import { VideoController } from './video.controller.js';
import { VideoService } from './video.service.js';
import { MediaPerceptualHash } from '../media/entities/media-perceptual-hash.entity.js';
import { MediaThumbnail } from '../media/entities/media-thumbnail.entity.js';
import { MediaPoster } from '../media/entities/media-poster.entity.js';
import { MediaTimeline } from '../media/entities/media-timeline.entity.js';
import { SentryModule } from '../sentry/sentry.module.js';
import { ImageModule } from '../image/image.module.js';
import { Media } from '../media/entities/media.entity.js';

@Module({
  providers: [VideoService, SubtitleService],
  controllers: [VideoController, SubtitleController],
  imports: [
    FfmpegModule,
    SentryModule,
    ImageModule,
    MikroOrmModule.forFeature([
      File,
      Media,
      FileMetadata,
      MediaSubtitle,
      MediaPerceptualHash,
      MediaThumbnail,
      MediaPoster,
      MediaTimeline,
    ]),
  ],
})
export class VideoModule {}
