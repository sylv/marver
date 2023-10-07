import type { EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Controller, Get, Param, Res } from '@nestjs/common';
import { type FastifyReply } from 'fastify';
import { createReadStream } from 'fs';
import parser from 'subtitle';
import { MediaSubtitleEntity } from './media-subtitle.entity.js';
import type { SubtitlesService } from './subtitles.service.js';

@Controller()
export class SubtitlesController {
  @InjectRepository(MediaSubtitleEntity)
  private subtitleRepo: EntityRepository<MediaSubtitleEntity>;
  constructor(private subtitleService: SubtitlesService) {}

  @Get('/subtitles/:supportId')
  async videoProxySubtitles(@Param('supportId') subtitleId: number, @Res() reply: FastifyReply) {
    const subtitles = await this.subtitleRepo.findOneOrFail({
      id: subtitleId,
    });

    let subStream = createReadStream(subtitles.path, 'utf8')
      .pipe(parser.parse())
      .pipe(parser.filter(this.subtitleService.cleanSubtitleNode))
      .pipe(parser.stringify({ format: 'WebVTT' }));

    reply
      .header(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(subtitles.displayName)}"`,
      )
      .header('Content-Type', 'text/vtt; charset=utf-8')
      .send(subStream);
  }
}