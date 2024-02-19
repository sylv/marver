import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { FfmpegModule } from '../ffmpeg/ffmpeg.module.js';
import { FilePosterEntity } from '../file/entities/assets/file-poster.entity.js';
import { FileThumbnailEntity } from '../file/entities/assets/file-thumbnail.entity.js';
import { FileTimelineEntity } from '../file/entities/assets/file-timeline.entity.js';
import { FileInfoEmbeddable } from '../file/entities/file-info.entity.js';
import { FilePerceptualHashEntity } from '../file/entities/file-perceptual-hash.entity.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { ImageModule } from '../image/image.module.js';
import { RehoboamModule } from '../rehoboam/rehoboam.module.js';
import { VideoController } from './video.controller.js';
import { VideoQueues } from './video.queues.js';

@Module({
  providers: [VideoQueues],
  controllers: [VideoController],
  imports: [
    FfmpegModule,
    RehoboamModule,
    ImageModule,
    MikroOrmModule.forFeature([
      FileEntity,
      FileInfoEmbeddable,
      FilePerceptualHashEntity,
      FileThumbnailEntity,
      FilePosterEntity,
      FileTimelineEntity,
    ]),
  ],
})
export class VideoModule {}
