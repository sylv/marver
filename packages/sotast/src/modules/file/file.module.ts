import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { SolomonModule } from '../solomon/solomon.module.js';
import { File } from './entities/file.entity.js';
import { FileResolver } from './file.resolver.js';
import { MediaService } from '../media/media.service.js';
import { FileScanService } from './file-scan.service.js';
import { FileTag } from './entities/file-tag.entity.js';
import { Tag } from './entities/tag.entity.js';
import { FileController } from './file.controller.js';
import { ImageModule } from '../image/image.module.js';
import { FileMetadataResolver } from './file-metadata.resolver.js';

@Module({
  controllers: [FileController],
  imports: [ImageModule, MikroOrmModule.forFeature([File, FileTag, Tag]), SolomonModule],
  providers: [FileResolver, FileScanService, MediaService, FileMetadataResolver],
  exports: [MediaService],
})
export class FileModule {}
