import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import { FileInfoEmbeddable } from '../file/entities/file-info.embeddable.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { MediaExifDataEntity } from '../media/entities/media-exif.entity.js';
import { FileModule } from '../file/file.module.js';
import { SolomonModule } from '../solomon/solomon.module.js';
import { ImageController } from './image.controller.js';
import { ImageService } from './image.service.js';
import { MediaEntity } from '../media/entities/media.entity.js';
import { ImageTasks } from './image.tasks.js';
import { MediaEmbeddingEntity } from '../media/entities/media-embedding.js';
import { MediaTextEntity } from '../media/entities/media-text.entity.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      FileEntity,
      FileInfoEmbeddable,
      MediaExifDataEntity,
      MediaEmbeddingEntity,
      MediaEntity,
      MediaTextEntity,
    ]),
    SolomonModule,
    forwardRef(() => FileModule),
  ],
  controllers: [ImageController],
  providers: [ImageService, ImageTasks],
  exports: [ImageService],
})
export class ImageModule {}
