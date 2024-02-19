import { Module } from '@nestjs/common';
import { SubtitlesController } from './subtitles.controller.js';
import { SubtitlesService } from './subtitles.service.js';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FileSubtitleEntity } from './file-subtitle.entity.js';

@Module({
  imports: [MikroOrmModule.forFeature([FileSubtitleEntity])],
  providers: [SubtitlesService],
  controllers: [SubtitlesController],
})
export class SubtitlesModule {}
