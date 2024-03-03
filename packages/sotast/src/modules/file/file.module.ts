import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CLIPModule } from '../clip/clip.module.js';
import { ImageModule } from '../image/image.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { FileEmbeddingEntity } from './entities/file-embedding.entity.js';
import { FileTagEntity } from './entities/file-tag.entity.js';
import { FileEntity } from './entities/file.entity.js';
import { TagEntity } from './entities/tag.entity.js';
import { FileScanService } from './file-scan.service.js';
import { FileController } from './file.controller.js';
import { FileResolver } from './file.resolver.js';

@Module({
  controllers: [FileController],
  imports: [
    StorageModule,
    ImageModule,
    CLIPModule,
    MikroOrmModule.forFeature([FileEntity, FileTagEntity, TagEntity, FileEmbeddingEntity]),
  ],
  providers: [FileResolver, FileScanService],
  exports: [],
})
export class FileModule {}
