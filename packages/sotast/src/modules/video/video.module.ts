import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { FfmpegModule } from '../ffmpeg/ffmpeg.module.js';
import { FileInfoEmbeddable } from '../file/entities/file-info.embeddable.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { ImageModule } from '../image/image.module.js';
import { MediaPerceptualHashEntity } from '../media/entities/media-perceptual-hash.entity.js';
import { MediaPosterEntity } from '../media/entities/media-poster.entity.js';
import { MediaSubtitleEntity } from '../media/entities/media-subtitle.entity.js';
import { MediaThumbnailEntity } from '../media/entities/media-thumbnail.entity.js';
import { MediaTimelineEntity } from '../media/entities/media-timeline.entity.js';
import { MediaEntity } from '../media/entities/media.entity.js';
import { SolomonModule } from '../solomon/solomon.module.js';
import { SubtitleController } from './subtitle.controller.js';
import { SubtitleService } from './subtitle.service.js';
import { VideoController } from './video.controller.js';
import { VideoQueues } from './video.queues.js';
import { MediaEmbeddingEntity } from '../media/entities/media-embedding.js';

@Module({
  providers: [VideoQueues, SubtitleService],
  controllers: [VideoController, SubtitleController],
  imports: [
    FfmpegModule,
    SolomonModule,
    ImageModule,
    MikroOrmModule.forFeature([
      FileEntity,
      MediaEntity,
      FileInfoEmbeddable,
      MediaSubtitleEntity,
      MediaPerceptualHashEntity,
      MediaEmbeddingEntity,
      MediaThumbnailEntity,
      MediaPosterEntity,
      MediaTimelineEntity,
    ]),
  ],
})
export class VideoModule {}
