import { Injectable, Logger } from "@nestjs/common";
import { Clip } from "@ryanke/rehoboam";
import { Embedding } from "../../@generated/core";
import { dedupe } from "../../helpers/dedupe";
import { DownloadService } from "../download/download.service";
import ms from "ms";

const CLIP_MODEL = {
  name: "ViT-B-32::openai",
  context_length: 77,
  visual_size: 224,
  textual_model: {
    url: "https://clip-as-service.s3.us-east-2.amazonaws.com/models-436c69702d61732d53657276696365/onnx/ViT-B-32/textual.onnx",
    hash: "55c85d8cbb096023781c1d13c557eb95d26034c111bd001b7360fdb7399eec68",
    path: "ViT-B-32/textual.onnx",
  },
  visual_model: {
    url: "https://clip-as-service.s3.us-east-2.amazonaws.com/models-436c69702d61732d53657276696365/onnx/ViT-B-32/textual.onnx",
    hash: "78e896b2c7301d01eda84e280d7c7297299aa6f8bacc0f5f8fe5bd60d42d8aae",
    path: "ViT-B-32/visual.onnx",
  },
  tokenizer_url: {
    url: "https://huggingface.co/openai/clip-vit-base-patch32/raw/main/tokenizer.json",
    hash: "b556ac8c99757ffb677208af34bc8c6721572114111a6e0aaf5fa69ff0b8d842",
    path: "tokenizer.json",
  },
};

@Injectable()
export class CLIPService {
  private log = new Logger(CLIPService.name);
  private _clip?: Clip;
  private _textUnloader?: NodeJS.Timeout;
  private _visualUnloader?: NodeJS.Timeout;
  constructor(private downloadService: DownloadService) {}

  @dedupe
  private async getCLIP() {
    if (this._clip) return this._clip;
    const [textualPath, visualPath, tokenizerPath] = await this.downloadService.ensureMany([
      {
        url: CLIP_MODEL.textual_model.url,
        hash: CLIP_MODEL.textual_model.hash,
        path: `clip/${CLIP_MODEL.textual_model.path}`,
      },
      {
        url: CLIP_MODEL.visual_model.url,
        hash: CLIP_MODEL.visual_model.hash,
        path: `clip/${CLIP_MODEL.visual_model.path}`,
      },
      {
        url: CLIP_MODEL.tokenizer_url.url,
        hash: CLIP_MODEL.tokenizer_url.hash,
        path: `clip/${CLIP_MODEL.tokenizer_url.path}`,
      },
    ]);

    this._clip = new Clip({
      contextLength: CLIP_MODEL.context_length,
      visionSize: CLIP_MODEL.visual_size,
      textModelPath: textualPath,
      visionModelPath: visualPath,
      tokenizerPath: tokenizerPath,
    });

    return this._clip;
  }

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

    const clip = await this.getCLIP();
    this.log.debug(`Encoding ${texts.length} texts with CLIP textual`);
    const result = await clip.batchEncodeText(texts);

    clearTimeout(this._textUnloader);
    this._textUnloader = setTimeout(() => {
      if (!this._clip) return;
      this.log.log("Unloading CLIP textual model");
      this._clip.unloadTextualSession();
    }, ms("5m"));

    return result.map((array) => {
      return {
        value: array,
        source: CLIP_MODEL.name,
      };
    });
  }

  async encodeImageBatch(imagePaths: string[]): Promise<Embedding[]> {
    clearTimeout(this._visualUnloader);

    const clip = await this.getCLIP();
    this.log.debug(`Encoding ${imagePaths.length} images with CLIP vision`);
    const result = await clip.batchEncodeImages(imagePaths);

    clearTimeout(this._visualUnloader);
    this._visualUnloader = setTimeout(() => {
      if (!this._clip) return;
      this.log.log("Unloading CLIP visual model");
      this._clip.unloadVisualSession();
    }, ms("5m"));

    return result.map((array) => {
      return {
        value: array,
        source: CLIP_MODEL.name,
      };
    });
  }
}
