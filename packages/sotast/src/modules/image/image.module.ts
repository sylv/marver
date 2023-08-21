import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import { FileMetadata } from '../file/entities/file-metadata.embeddable.js';
import { File } from '../file/entities/file.entity.js';
import { MediaExifData } from '../media/entities/media-exif.entity.js';
import { FileModule } from '../file/file.module.js';
import { SentryModule } from '../sentry/sentry.module.js';
import { ImageController } from './image.controller.js';
import { ImageService } from './image.service.js';
import { Media } from '../media/entities/media.entity.js';
import { ImageTasks } from './image.tasks.js';
import { MediaVector } from '../media/entities/media-vector.entity.js';
import { MediaText } from '../media/entities/media-text.entity.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([File, FileMetadata, MediaExifData, MediaVector, Media, MediaText]),
    SentryModule,
    forwardRef(() => FileModule),
  ],
  controllers: [ImageController],
  providers: [ImageService, ImageTasks],
  exports: [ImageService],
})
export class ImageModule {}
