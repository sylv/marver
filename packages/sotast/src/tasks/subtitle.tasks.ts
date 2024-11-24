import { Injectable } from "@nestjs/common";
import { VIDEO_EXTENSIONS } from "../constants";
import type { FileEntity } from "../modules/file/entities/file.entity";
import { SubtitlesService } from "../modules/subtitles/subtitles.service";
import { Queue } from "../modules/queue/queue.decorator";

@Injectable()
export class SubtitleTasks {
  constructor(private subtitleService: SubtitlesService) {}

  @Queue("VIDEO_EXTRACT_OR_GENERATE_SUBTITLES", {
    targetConcurrency: 1,
    fileFilter: {
      extension: { $in: [...VIDEO_EXTENSIONS] },
      info: {
        // require that ffprobe be run on the file first so we can determine
        // whether to extract embedded or to generate new
        hasEmbeddedSubtitles: { $ne: null },
      },
    },
  })
  async extractOrGenerateSubtitles(file: FileEntity) {
    if (file.info.hasEmbeddedSubtitles) {
      await this.subtitleService.extractEmbeddedSubtitles(file);
    } else {
      await this.subtitleService.generateSubtitles(file);
    }
  }
}
