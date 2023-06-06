import { EntityManager, EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { mkdir, readFile } from 'fs/promises';
import ISO6391 from 'iso-639-1';
import LanguageDetect from 'languagedetect';
import { dirname, join } from 'path';
import { stripHtml } from 'string-strip-html';
import { Node, parseSync } from 'subtitle';
import { VIDEO_EXTENSIONS } from '../../constants.js';
import { FfmpegService } from '../ffmpeg/ffmpeg.service.js';
import { File } from '../file/entities/file.entity.js';
import { MediaSubtitle } from '../media/entities/media-subtitle.entity.js';
import { Task } from '../tasks/task.decorator.js';
import { TaskType } from '../tasks/task.enum.js';

const SUBTITLE_STRIP_PATTERN =
  /JOINNOW|free code|Downloaded from|Support us and become a VIP member|subtitles|corrected by|corrections by|rate this subtitle|created by|Advertise your product or brand here|tvsubtitles|YTS|YIFY|www\.|https:|ripped by|opensubtitles|sub(scene|rip)|podnapisi|addic7ed|titlovi|bozxphd|sazu489|psagmeno|normita|anoxmous|\. ?com|©|™|Free Online Movies|Subtitle edited by/;

@Injectable()
export class SubtitleService {
  @InjectRepository(MediaSubtitle) private subtitleRepo: EntityRepository<MediaSubtitle>;
  constructor(private ffmpegService: FfmpegService, private em: EntityManager) {}

  @Task(TaskType.VideoGenerateSubtitles, {
    concurrency: 1,
    filter: {
      extension: { $in: [...VIDEO_EXTENSIONS] },
      media: {
        $and: [
          {
            subtitles: { id: null },
          },
          {
            $or: [
              // videos that have embedded subtitles, that we'll extract
              // we don't check duration here because if they have subtitles we want to extract them.
              {
                hasEmbeddedSubtitles: true,
              },
              // // videos with audio that we haven't already checked for subtitles
              // // only longer videos because generating subtitles for short videos
              // // is unlikely to be that useful.
              // {
              //   metadata: {
              //     hasAudio: true,
              //     nonVerbal: null,
              //     durationSeconds: {
              //       $gt: ms('10m'),
              //     },
              //   },
              // },
            ],
          },
        ],
      },
    },
  })
  async generateSubtitles(file: File) {
    const media = file.media!;
    if (media.hasEmbeddedSubtitles) {
      // we extract the subtitles to a separate file so they're easier to work with
      const ffprobeResult = await this.ffmpegService.ffprobe(media.file.path);
      const subtitleStreams = ffprobeResult.streams.filter((stream) => stream.codec_type === 'subtitle');
      for (const subtitleStream of subtitleStreams) {
        const fileName = `embedded_${subtitleStream.index}.srt`;
        const outputPath = join(media.file.metadataFolder, 'subtitles', fileName);
        await mkdir(dirname(outputPath), { recursive: true });
        await this.ffmpegService.extractSubtitles(media.file.path, outputPath, subtitleStream.index);
        const languageName = await this.guessLanguage(outputPath);
        const fileSupport = this.subtitleRepo.create({
          media: media,
          forced: subtitleStream.disposition?.forced === 1,
          hearingImpaired: subtitleStream.disposition?.hearing_impaired === 1,
          path: outputPath,
          generated: false,
          languageIso639_1: languageName,
        });

        this.em.persist(fileSupport);
      }

      await this.em.flush();
      return;
    }
  }

  async guessLanguage(subtitlePath: string) {
    const dector = new LanguageDetect();
    const guessCounts = new Map<string, number>();
    const content = await readFile(subtitlePath, 'utf8');
    const result = parseSync(content);

    for (const node of result) {
      if (node.type !== 'cue') continue;
      const cleaned = this.cleanSubtitleNode(node);
      if (!cleaned) continue;
      const guesses = dector.detect(node.data.text, 2);
      if (!guesses[1]) continue;
      if (guesses[0][1] < 0.2) continue;
      if (guesses[0][1] - guesses[1][1] > 0.1) {
        const topGuessName = guesses[0];
        const existingGuess = guessCounts.get(topGuessName[0]) || 0;
        guessCounts.set(topGuessName[0], existingGuess + 1);
      }
    }

    const sortedGuesses = [...guessCounts.entries()].sort((a, b) => b[1] - a[1]);
    if (sortedGuesses[0]) return ISO6391.getCode(sortedGuesses[0][0]);
    return 'en';
  }

  cleanSubtitleNode(node: Node) {
    if (node.type === 'cue') {
      if (SUBTITLE_STRIP_PATTERN.test(node.data.text)) return false;
      node.data.text = stripHtml(node.data.text, { ignoreTags: ['i', 'b', 'u', 'v'] }).result;
      if (!node.data.text.trim()) return false;
    }

    return true;
  }
}
