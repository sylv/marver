import { Module } from '@nestjs/common';
import { MediaService } from './media.service.js';
import { MediaResolver } from './media.resolver.js';
import { FileModule } from '../file/file.module.js';
import { ImageModule } from '../image/image.module.js';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MediaEntity } from './entities/media.entity.js';
import { RehoboamModule } from '../rehoboam/rehoboam.module.js';

@Module({
  imports: [FileModule, ImageModule, RehoboamModule, MikroOrmModule.forFeature([MediaEntity])],
  providers: [MediaResolver, MediaService],
})
export class MediaModule {}
