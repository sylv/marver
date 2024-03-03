import { EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, Controller, Get, Headers, Param, Res } from '@nestjs/common';
import { type FastifyReply } from 'fastify';
import parseRange from 'range-parser';
import { StorageService } from '../storage/storage.service.js';
import { FileEntity } from './entities/file.entity.js';

@Controller()
export class FileController {
  @InjectRepository(FileEntity) private fileRepo: EntityRepository<FileEntity>;
  constructor(private storageService: StorageService) {}

  @Get('/files/:fileId/raw')
  async readFile(
    @Res() reply: FastifyReply,
    @Param('fileId') fileId: string,
    @Headers('Range') range?: string,
  ) {
    const file = await this.fileRepo.findOneOrFail(fileId);
    const parsedRange = range ? this.getRange(range, file.size) : null;
    const stream = await this.storageService.createReadStreamHttp(file, {
      start: parsedRange?.start,
      end: parsedRange?.end,
    });

    if (parsedRange) {
      reply
        .header('Content-Range', `bytes ${parsedRange.start}-${parsedRange.end}/${file.size}`)
        .header('Content-Length', parsedRange.end - parsedRange.start + 1)
        .status(206);
    } else {
      reply.header('Content-Length', file.size);
    }

    reply
      .header('Content-Type', file.mimeType || 'application/octet-stream')
      .header('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`)
      .header('Accept-Ranges', 'bytes')
      .send(stream);
  }

  private getRange(range: string, size: number): { start: number; end: number } | null {
    const ranges = parseRange(size, range);
    if (ranges === -1) throw new BadRequestException('Invalid range');
    if (ranges === -2) throw new BadRequestException('Invalid range');
    return ranges[0];
  }
}
