import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { SolomonModule } from '../solomon/solomon.module.js';
import { FileEntity } from './entities/file.entity.js';
import { FileResolver } from './file.resolver.js';
import { MediaService } from '../media/media.service.js';
import { FileScanService } from './file-scan.service.js';
import { FileTagEntity } from './entities/file-tag.entity.js';
import { TagEntity } from './entities/tag.entity.js';
import { FileController } from './file.controller.js';
import { ImageModule } from '../image/image.module.js';
import { FileInfoResolver } from './file-metadata.resolver.js';

@Module({
  controllers: [FileController],
  imports: [
    ImageModule,
    MikroOrmModule.forFeature([FileEntity, FileTagEntity, TagEntity]),
    SolomonModule,
  ],
  providers: [FileResolver, FileScanService, MediaService, FileInfoResolver],
  exports: [MediaService],
})
export class FileModule {}
