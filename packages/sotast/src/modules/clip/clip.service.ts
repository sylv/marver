import { Injectable, Logger } from "@nestjs/common";
import { SigLip } from "@ryanke/rehoboam";
import { config } from "../../config";

@Injectable()
export class CLIPService {
  private log = new Logger(CLIPService.name);
  private clip = new SigLip(config.use_quantized);

  async encodeText(text: string, cacheResult: boolean): Promise<number[]> {
    const result = await this.encodeTextBatch([text], cacheResult);
    return result[0];
  }

  async encodeImage(imagePath: string): Promise<number[]> {
    const result = await this.encodeImageBatch([imagePath]);
    return result[0];
  }

  async encodeTextBatch(texts: string[], cacheResult: boolean): Promise<number[][]> {
    this.log.debug(`Encoding ${texts.length} texts with CLIP textual`);
    const result = await this.clip.batchEncodeTexts(texts, cacheResult);
    return result;
  }

  async encodeImageBatch(imagePaths: string[]): Promise<number[][]> {
    this.log.debug(`Encoding ${imagePaths.length} images with CLIP vision`);
    const result = await this.clip.batchEncodeImages(imagePaths);
    return result;
  }
}
