import { Module } from '@nestjs/common';
import { MediaService } from './media.service.js';
import { MediaResolver } from './media.resolver.js';
import { FileModule } from '../file/file.module.js';
import { ImageModule } from '../image/image.module.js';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Media } from './entities/media.entity.js';
import { SolomonModule } from '../solomon/solomon.module.js';

@Module({
  imports: [FileModule, ImageModule, SolomonModule, MikroOrmModule.forFeature([Media])],
  providers: [MediaResolver, MediaService],
})
export class MediaModule {}
