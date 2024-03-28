import { EntityManager, EntityRepository } from "@mikro-orm/better-sqlite";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, Logger } from "@nestjs/common";
import { mkdir, readFile } from "node:fs/promises";
import ISO6391 from "iso-639-1";
import LanguageDetect from "languagedetect";
import { dirname, join } from "node:path";
import { stripHtml } from "string-strip-html";
import { parseSync, type Node } from "subtitle";
import { VIDEO_EXTENSIONS } from "../../constants.js";
import { FfmpegService } from "../ffmpeg/ffmpeg.service.js";
import { FileEntity } from "../file/entities/file.entity.js";
import { Queue } from "../queue/queue.decorator.js";
import { FileSubtitleEntity } from "./file-subtitle.entity.js";

const SUBTITLE_STRIP_PATTERN =
  /JOINNOW|free code|Downloaded from|Support us and become a VIP member|subtitles|corrected by|corrections by|rate this subtitle|created by|Advertise your product or brand here|tvsubtitles|YTS|YIFY|www\.|https:|ripped by|opensubtitles|sub(scene|rip)|podnapisi|addic7ed|titlovi|bozxphd|sazu489|psagmeno|normita|anoxmous|\. ?com|©|™|Free Online Movies|Subtitle edited by/;

@Injectable()
export class SubtitlesService {
  @InjectRepository(FileSubtitleEntity)
  private subtitleRepo: EntityRepository<FileSubtitleEntity>;
  private log = new Logger(SubtitlesService.name);
  constructor(
    private ffmpegService: FfmpegService,
    private em: EntityManager,
  ) {}

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
      await this.extractEmbeddedSubtitles(file);
    } else {
      await this.generateSubtitles(file);
    }
  }

  private async generateSubtitles(file: FileEntity) {
    // TODO: implement
  }

  private async extractEmbeddedSubtitles(file: FileEntity) {
    const ffprobeResult = await this.ffmpegService.ffprobe(file.path);
    const subtitleStreams = ffprobeResult.streams.filter((stream) => stream.codec_type === "subtitle");

    let madeDir = false;
    for (const subtitleStream of subtitleStreams) {
      const fileName = `embedded_${subtitleStream.index}.srt`;
      const outputPath = join(file.assetFolder, "subtitles", fileName);

      if (!madeDir) {
        await mkdir(dirname(outputPath), { recursive: true });
        madeDir = true;
      }

      await this.ffmpegService.extractSubtitles(file.path, outputPath, subtitleStream.index);

      const languageName = await this.guessLanguage(outputPath);
      const fileSupport = this.subtitleRepo.create({
        file: file,
        forced: subtitleStream.disposition?.forced === 1,
        hearingImpaired: subtitleStream.disposition?.hearing_impaired === 1,
        path: outputPath,
        generated: false,
        languageIso639_1: languageName,
      });

      this.em.persist(fileSupport);
    }

    await this.em.flush();
  }

  async guessLanguage(subtitlePath: string) {
    const dector = new LanguageDetect();
    const guessCounts = new Map<string, number>();
    const content = await readFile(subtitlePath, "utf8");
    const result = parseSync(content);

    for (const node of result) {
      if (node.type !== "cue") continue;
      const cleaned = this.cleanSubtitleNode(node);
      if (!cleaned) continue;
      const guesses = dector.detect(node.data.text, 2);
      if (!guesses[1]) continue; // require at least 2 guesses
      if (guesses[0][1] < 0.2) continue; // require at least 20% confidence
      if (guesses[0][1] - guesses[1][1] > 0.1) {
        // require at least 10% difference between top 2 guesses
        const topGuessName = guesses[0];
        const existingGuess = guessCounts.get(topGuessName[0]) || 0;
        guessCounts.set(topGuessName[0], existingGuess + 1);
      }
    }

    const sortedGuesses = [...guessCounts.entries()].sort((a, b) => b[1] - a[1]);
    if (sortedGuesses[0]) {
      const result = ISO6391.getCode(sortedGuesses[0][0]);
      if (result) return result;
      else this.log.error(`Failed to find ISO639-1 code for ${sortedGuesses[0][0]}`);
    }

    return "en";
  }

  cleanSubtitleNode(node: Node) {
    if (node.type === "cue") {
      if (SUBTITLE_STRIP_PATTERN.test(node.data.text)) return false;
      node.data.text = stripHtml(node.data.text, { ignoreTags: ["i", "b", "u", "v"] }).result;
      if (!node.data.text.trim()) return false;
    }

    return true;
  }
}
