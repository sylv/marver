import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import { FileExifDataEntity } from '../file/entities/file-exif.entity.js';
import { FileInfoEmbeddable } from '../file/entities/file-info.entity.js';
import { FileTextEntity } from '../file/entities/file-text.entity.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { FileModule } from '../file/file.module.js';
import { RehoboamModule } from '../rehoboam/rehoboam.module.js';
import { ImageController } from './image.controller.js';
import { ImageService } from './image.service.js';
import { ImageTasks } from './image.tasks.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([FileEntity, FileInfoEmbeddable, FileExifDataEntity, FileTextEntity]),
    RehoboamModule,
    forwardRef(() => FileModule),
  ],
  controllers: [ImageController],
  providers: [ImageService, ImageTasks],
  exports: [ImageService],
})
export class ImageModule {}
