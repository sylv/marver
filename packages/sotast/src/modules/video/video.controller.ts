import type { EntityRepository } from '@mikro-orm/sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { spawn } from 'child_process';
import { createHash } from 'crypto';
import { type FastifyReply } from 'fastify';
import { type FfprobeData } from 'fluent-ffmpeg';
import { createReadStream } from 'fs';
import { mkdir, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { performance } from 'perf_hooks';
import { config } from '../../config.js';
import { FfmpegService } from '../ffmpeg/ffmpeg.service.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { type Dimensions, scaleDimensions } from '../../helpers/scale-dimensions.js';

@Controller()
export class VideoController {
  @InjectRepository(FileEntity) private fileRepo: EntityRepository<FileEntity>;
  private log = new Logger(VideoController.name);
  constructor(private ffmpegService: FfmpegService) {}

  @Get('/files/:fileId/vidproxy/index.m3u8')
  async videoProxy(@Param('fileId') fileId: string, @Res() reply: FastifyReply) {
    const file = await this.fileRepo.findOneOrFail(fileId);
    if (file.info.unavailable) {
      throw new NotFoundException('File is unavailable');
    }

    const ffprobe = await this.ffmpegService.ffprobe(file.path);
    const videoStream = this.getStream(ffprobe, 'video');
    const lines = ['#EXTM3U\n'];

    for (const profile of config.transcode.video_profiles) {
      if (profile.max_height && videoStream.height && profile.max_height > videoStream.height)
        continue;
      if (profile.max_width && videoStream.width && profile.max_width > videoStream.width) continue;
      const scaledSize = scaleDimensions(videoStream as Dimensions, {
        maxHeight: profile.max_height,
        maxWidth: profile.max_width,
      });

      const bitrate = profile.bitrate || videoStream.bit_rate!;
      lines.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${bitrate},RESOLUTION=${scaledSize.width}x${scaledSize.height}`,
      );
      lines.push(`${encodeURIComponent(profile.name)}.m3u8\n`);
    }

    if (config.is_development) {
      // makes debugging easier, you can view the m3u8 file in the browser
      // without it trying to download it as a file.
      reply
        .header('Content-Type', 'text/plain; charset=utf-8')
        .header('Content-Disposition', 'inline');
    } else {
      // more "correct" + caching
      reply
        .header('Content-Type', 'application/vnd.apple.mpegurl')
        .header('Cache-Control', 'public, max-age=60');
    }

    reply.send(lines.join('\n'));
  }

  @Get('/files/:fileId/vidproxy/:profileName.m3u8')
  async videoProxyProfile(
    @Param('fileId') fileId: string,
    @Param('profileName') profileName: string,
  ) {
    const profile = config.transcode.video_profiles.find((p) => p.name === profileName);
    if (!profile) throw new BadRequestException('Invalid profile');

    const file = await this.fileRepo.findOneOrFail(fileId);
    if (file.info.unavailable) {
      throw new NotFoundException('File is unavailable');
    }

    const ffprobe = await this.ffmpegService.ffprobe(file.path);
    const duration = +ffprobe.format.duration!;
    const lines = [
      '#EXTM3U',
      '#EXT-X-VERSION:4',
      '#EXT-X-PLAYLIST-TYPE:VOD',
      '#EXT-X-MEDIA-SEQUENCE:0',
      `#EXT-X-TARGETDURATION:${profile.segment_duration}\n`,
    ];

    let remainingDuration = duration;
    let segmentIndex = 0;
    while (remainingDuration > 0) {
      const segment_duration =
        remainingDuration > profile.segment_duration ? profile.segment_duration : remainingDuration;
      segmentIndex++;

      const startPosition = duration - remainingDuration;
      const queryParams = {
        sp: startPosition.toString(),
      };

      const query = new URLSearchParams(queryParams);
      lines.push(`#EXTINF:${segment_duration},`);
      lines.push(`${encodeURIComponent(profile.name)}/${segmentIndex}.ts?${query}\n`);
      remainingDuration -= segment_duration;
    }

    lines.push('#EXT-X-ENDLIST');
    return lines.join('\n');
  }

  @Get('/files/:fileId/vidproxy/:profileName/:segmentIndex.ts')
  async videoProxySegment(
    @Param('fileId') fileId: string,
    @Param('profileName') profileName: string,
    @Param('segmentIndex') segmentIndex: string,
    @Query('sp', ParseIntPipe) startPosition: number,
    @Res() reply: FastifyReply,
  ) {
    const start = performance.now();
    const profile = config.transcode.video_profiles.find((p) => p.name === profileName);
    if (!profile) throw new BadRequestException('Invalid profile');
    const file = await this.fileRepo.findOneOrFail(fileId, {
      fields: ['path'],
    });

    const ffprobe = await this.ffmpegService.ffprobe(file.path);
    const videoStream = this.getStream(ffprobe, 'video');

    const bitrate = (profile.bitrate || +videoStream.bit_rate!) / 1000 + 'k';
    const timeLimit = profile.segment_duration * 2;
    const args: string[] = [
      // limit the max runtime, if it cant finish in this amount of time
      // there is no way the stream will be smooth.
      '-timelimit',
      timeLimit.toString(),

      '-ss',
      startPosition.toString(), // seek to segment start position, must be before -i
      '-i',
      file.path,
      '-t',
      profile.segment_duration.toString(),
      '-sn', // disable subtitles

      // h264 video
      '-c:v',
      'libx264',
      '-b:v',
      bitrate.toString(),
      '-preset',
      'superfast',
      '-profile:v',
      'high',
      '-level',
      '4.0',
      '-pix_fmt',
      'yuv420p',

      '-force_key_frames',
      `expr:gte(t,n_forced*${profile.segment_duration})`,

      // https://ffmpeg.org/ffmpeg-formats.html#segment_002c-stream_005fsegment_002c-ssegment
      '-f',
      'stream_segment',
      '-segment_time_delta',
      '0.2',
      '-segment_format',
      'mpegts',
      '-segment_time',
      profile.segment_duration.toString(),
      '-output_ts_offset',
      startPosition.toString(),
      '-segment_start_number',
      segmentIndex,
    ];

    const audioStream = ffprobe.streams.find((s) => s.codec_type === 'audio');
    if (audioStream) {
      // if we dont specify audio channels, it breaks some streams.
      const channels = audioStream.channels || 2;
      args.push('-c:a', 'aac', '-b:a', '192k', '-ac', channels.toString(), '-async', '1');
    }

    args.push('-vf', `scale=${profile.max_width || '-2'}:${profile.max_height || '-2'}`);

    const hasher = createHash('sha256');
    hasher.update(JSON.stringify(profile));
    hasher.update(file.path);
    hasher.update(bitrate);
    if (process.env.NODE_ENV !== 'production') {
      // todo: shouldn't be doing this but in dev its necessary
      hasher.update(JSON.stringify(args));
    }

    const segmentsKey = hasher.digest('hex');
    const outDir = join(tmpdir(), 'vidproxy/segments', segmentsKey);
    const outTemplate = join(outDir, `seg-%05d.ts`);
    const outFile = join(outDir, `seg-${segmentIndex.padStart(5, '0')}.ts`);

    const existingFile = await stat(outFile).catch(() => null);

    if (existingFile) {
      reply
        // .header('Content-Type', 'video/mp2t')
        .header('Content-Length', existingFile.size)
        .send(createReadStream(outFile));

      return;
    }

    args.push(outTemplate);
    await mkdir(outDir, { recursive: true });

    this.log.debug(
      `Running "ffmpeg ${args.join(' ')}" for segment ${segmentIndex} of ${file.path}`,
    );
    const ffmpeg = spawn('ffmpeg', args, {
      // todo: toggling passthrough should be a config option
      // or, forwarding it to a viewable stream somewhere.
      // stdio: ['ignore', 'ignore', 'inherit'],
      stdio: ['ignore', 'ignore', 'ignore'],
    });

    await new Promise<true>((resolve, reject) => {
      ffmpeg.on('exit', (code) => {
        if (code === 0) resolve(true);
        else reject(new Error(`ffmpeg exited with code ${code}`));
      });
    });

    this.log.debug(`Finished segment ${segmentIndex} in ${performance.now() - start}ms`);
    // return createReadStream(outFile);
    reply.send(createReadStream(outFile));
  }

  private getStream(ffprobeResult: FfprobeData, type: 'video' | 'audio') {
    const stream = ffprobeResult.streams.find((s) => s.codec_type === type);
    if (!stream) throw new BadRequestException(`No ${type} stream found`);
    return stream;
  }
}
