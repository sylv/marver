import { EntityRepository } from "@mikro-orm/better-sqlite";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Controller, Get, Param, Res } from "@nestjs/common";
import { type FastifyReply } from "fastify";
import { createReadStream } from "node:fs";
import parser from "subtitle";
import { FileSubtitleEntity } from "./file-subtitle.entity.js";
import { SubtitlesService } from "./subtitles.service.js";

@Controller()
export class SubtitlesController {
  @InjectRepository(FileSubtitleEntity)
  private subtitleRepo: EntityRepository<FileSubtitleEntity>;
  constructor(private subtitleService: SubtitlesService) {}

  @Get("/subtitles/:supportId")
  async videoProxySubtitles(@Param("supportId") subtitleId: number, @Res() reply: FastifyReply) {
    const subtitles = await this.subtitleRepo.findOneOrFail({
      id: subtitleId,
    });

    const subStream = createReadStream(subtitles.getPath(), "utf8")
      .pipe(parser.parse())
      .pipe(parser.filter((node) => this.subtitleService.cleanSubtitleNode(node)))
      .pipe(parser.stringify({ format: "WebVTT" }));

    reply
      .header("Content-Disposition", `inline; filename="${encodeURIComponent(subtitles.name)}"`)
      .header("Content-Type", "text/vtt; charset=utf-8")
      .send(subStream);
  }
}
