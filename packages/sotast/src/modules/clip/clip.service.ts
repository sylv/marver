import { Injectable, Logger } from "@nestjs/common";
import { SigLip } from "@ryanke/rehoboam";
import ms from "ms";
import type { Embedding } from "../../helpers/embedding";
import { config } from "../../config";

@Injectable()
export class CLIPService {
  private log = new Logger(CLIPService.name);
  private clip = new SigLip(config.use_quantized);
  private _textUnloader?: NodeJS.Timeout;
  private _visualUnloader?: NodeJS.Timeout;

  async encodeText(text: string): Promise<Embedding> {
    const result = await this.encodeTextBatch([text]);
    return result[0];
  }

  async encodeImage(imagePath: string): Promise<Embedding> {
    const result = await this.encodeImageBatch([imagePath]);
    return result[0];
  }

  async encodeTextBatch(texts: string[]): Promise<Embedding[]> {
    clearTimeout(this._textUnloader);

    this.log.debug(`Encoding ${texts.length} texts with CLIP textual`);
    const result = await this.clip.batchEncodeTexts(texts);

    clearTimeout(this._textUnloader);
    this._textUnloader = setTimeout(() => {
      this.log.log("Unloading CLIP textual model");
      this.clip.unloadTextualSession();
    }, ms("5m"));

    return result;
  }

  async encodeImageBatch(imagePaths: string[]): Promise<Embedding[]> {
    clearTimeout(this._visualUnloader);

    this.log.debug(`Encoding ${imagePaths.length} images with CLIP vision`);
    const result = await this.clip.batchEncodeImages(imagePaths);

    clearTimeout(this._visualUnloader);
    this._visualUnloader = setTimeout(() => {
      this.log.log("Unloading CLIP visual model");
      this.clip.unloadVisualSession();
    }, ms("5m"));

    return result;
  }
}
