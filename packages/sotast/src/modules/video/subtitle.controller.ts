import type { EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Controller, Get, Param, Res } from '@nestjs/common';
import { type FastifyReply } from 'fastify';
import { createReadStream } from 'fs';
import parser from 'subtitle';
import { MediaSubtitle } from '../media/entities/media-subtitle.entity.js';
import { SubtitleService } from './subtitle.service.js';

@Controller()
export class SubtitleController {
  @InjectRepository(MediaSubtitle) private subtitleRepo: EntityRepository<MediaSubtitle>;
  constructor(private subtitleService: SubtitleService) {}

  @Get('/subtitles/:supportId')
  async videoProxySubtitles(@Param('supportId') subtitleId: string, @Res() reply: FastifyReply) {
    const subtitles = await this.subtitleRepo.findOneOrFail({
      id: subtitleId,
    });

    const subStream = createReadStream(subtitles.path, 'utf8')
      .pipe(parser.parse())
      .pipe(parser.filter(this.subtitleService.cleanSubtitleNode))
      .pipe(parser.stringify({ format: 'WebVTT' }));

    reply
      .header('Content-Disposition', `inline; filename="${encodeURIComponent(subtitles.displayName)}"`)
      .header('Content-Type', 'text/vtt; charset=utf-8')
      .send(subStream);
  }
}
