import { Module } from '@nestjs/common';
import { SubtitlesController } from './subtitles.controller.js';
import { SubtitlesService } from './subtitles.service.js';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FileSubtitleEntity } from './file-subtitle.entity.js';
import { FfmpegModule } from '../ffmpeg/ffmpeg.module.js';

@Module({
  imports: [FfmpegModule, MikroOrmModule.forFeature([FileSubtitleEntity])],
  providers: [SubtitlesService],
  controllers: [SubtitlesController],
})
export class SubtitlesModule {}
