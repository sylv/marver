import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { FfmpegModule } from "../ffmpeg/ffmpeg.module.js";
import { FileSubtitleEntity } from "./file-subtitle.entity.js";
import { SubtitlesController } from "./subtitles.controller.js";
import { SubtitlesService } from "./subtitles.service.js";

@Module({
  imports: [FfmpegModule, MikroOrmModule.forFeature([FileSubtitleEntity])],
  providers: [SubtitlesService],
  exports: [SubtitlesService],
  controllers: [SubtitlesController],
})
export class SubtitlesModule {}
