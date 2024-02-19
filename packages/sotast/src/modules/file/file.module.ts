import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ImageModule } from '../image/image.module.js';
import { RehoboamModule } from '../rehoboam/rehoboam.module.js';
import { FileTagEntity } from './entities/file-tag.entity.js';
import { FileEntity } from './entities/file.entity.js';
import { TagEntity } from './entities/tag.entity.js';
import { FileScanService } from './file-scan.service.js';
import { FileController } from './file.controller.js';
import { FileResolver } from './file.resolver.js';
import { FileService } from './file.service.js';

@Module({
  controllers: [FileController],
  imports: [
    ImageModule,
    MikroOrmModule.forFeature([FileEntity, FileTagEntity, TagEntity]),
    RehoboamModule,
  ],
  providers: [FileResolver, FileScanService, FileService],
  exports: [],
})
export class FileModule {}
