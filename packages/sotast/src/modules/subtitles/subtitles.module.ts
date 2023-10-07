import { Module } from '@nestjs/common';
import { SubtitlesController } from './subtitles.controller.js';
import { SubtitlesService } from './subtitles.service.js';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MediaSubtitleEntity } from './media-subtitle.entity.js';

@Module({
  imports: [MikroOrmModule.forFeature([MediaSubtitleEntity])],
  providers: [SubtitlesService],
  controllers: [SubtitlesController],
})
export class SubtitlesModule {}
