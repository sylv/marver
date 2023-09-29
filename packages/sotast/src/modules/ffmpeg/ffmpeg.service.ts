import { Injectable } from '@nestjs/common';
import ffmpeg, { type FfprobeData } from 'fluent-ffmpeg';
import { LRUCache } from 'lru-cache';
import ms from 'ms';
import { JobError } from '../queue/job.error.js';

@Injectable()
export class FfmpegService {
  private readonly ffprobeCache = new LRUCache<string, FfprobeData>({
    max: 500,
    ttl: ms('1h'),
  });

  ffprobe(path: string): Promise<FfprobeData> {
    const cached = this.ffprobeCache.get(path);
    if (cached) return Promise.resolve(cached);
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(path, (err, metadata) => {
        if (err) {
          if (err.message.includes('Invalid data found when processing input')) {
            reject(new JobError(err.message, { corruptFile: true }));
          } else {
            reject(err);
          }

          return;
        }

        const stripped = this.stripNAValues(metadata);
        this.ffprobeCache.set(path, stripped);
        resolve(stripped);
      });
    });
  }

  async extractSubtitles(inputPath: string, outputPath: string, streamIndex: number) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions('-map', `0:${streamIndex}`)
        .output(outputPath)
        .on('error', reject)
        .on('end', resolve)
        .run();
    });
  }

  private stripNAValues<T extends Record<string, any>>(data: T): T {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === 'N/A' || value === 'unknown') clean[key] = null;
      else if (Array.isArray(value)) clean[key] = value.map((v) => this.stripNAValues(v));
      else if (typeof value === 'object') clean[key] = this.stripNAValues(value);
      else clean[key] = value;
    }

    return clean as T;
  }
}
