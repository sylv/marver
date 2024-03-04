import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import bytes from 'bytes';
import ms from 'ms';
import { CacheModule } from '../cache/cache.module.js';
import { CLIPModule } from '../clip/clip.module.js';
import { FileEmbeddingEntity } from '../file/entities/file-embedding.entity.js';
import { FileExifDataEntity } from '../file/entities/file-exif.entity.js';
import { FileInfoEmbeddable } from '../file/entities/file-info.entity.js';
import { FileTextEntity } from '../file/entities/file-text.entity.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { FileModule } from '../file/file.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { ImageController } from './image.controller.js';
import { ImageService } from './image.service.js';
import { ImageTasks } from './image.tasks.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      FileEntity,
      FileInfoEmbeddable,
      FileExifDataEntity,
      FileTextEntity,
      FileEmbeddingEntity,
    ]),
    CLIPModule,
    StorageModule,
    CacheModule.forCache({
      name: 'processed_images',
      expireAfter: ms('7d'),
      maxSize: bytes.parse('1gb'),
      maxItems: 5000,
    }),
    forwardRef(() => FileModule),
  ],
  controllers: [ImageController],
  providers: [ImageService, ImageTasks],
  exports: [ImageService],
})
export class ImageModule {}
