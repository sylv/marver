import { Logger } from "@nestjs/common";
import {
  AutoProcessor,
  CLIPTextModelWithProjection,
  CLIPTokenizer,
  CLIPVisionModelWithProjection,
  RawImage,
  type Processor,
  type Tensor,
} from "@xenova/transformers";
import ms from "ms";
import type { Embedding } from "../../@generated/core";
import { dedupe } from "../../helpers/dedupe";
import { expiringValue } from "../../helpers/expire-value";
import { progressCallback } from "../../helpers/progress-callback";

enum ClipEmbeddingModelType {
  OPENAI__CLIP_VIT_BASE_PATCH32 = 1,
  OPENAI__CLIP_VIT_BASE_PATCH16 = 2,
}

const CURRENT_MODEL = ClipEmbeddingModelType.OPENAI__CLIP_VIT_BASE_PATCH32;

export class CLIPService {
  private processor?: Processor;
  private tokenizer?: CLIPTokenizer;
  private log = new Logger(CLIPService.name);
  private textModel = expiringValue<CLIPTextModelWithProjection>(ms(`5min`), (value) => {
    this.log.debug(`Disposing of CLIP text model`);
    value.dispose();
  });

  private visionModel = expiringValue<CLIPVisionModelWithProjection>(ms(`30sec`), (value) => {
    this.log.debug(`Disposing of CLIP vision model`);
    value.dispose();
  });

  @dedupe
  async getTextModel() {
    if (this.textModel.value && this.tokenizer) {
      return {
        tokenizer: this.tokenizer,
        model: this.textModel.value,
      };
    }

    this.log.debug("Loading CLIP text model");
    const modelName = this.modelTypeToName(CURRENT_MODEL);
    if (!this.textModel.value) {
      this.textModel.value = await CLIPTextModelWithProjection.from_pretrained(modelName, {
        progress_callback: progressCallback,
      });
    }

    if (!this.tokenizer) {
      this.tokenizer = await CLIPTokenizer.from_pretrained(modelName, {
        progress_callback: progressCallback,
      });
    }

    return {
      tokenizer: this.tokenizer,
      model: this.textModel.value,
    };
  }

  @dedupe
  async getVisionModel() {
    if (this.visionModel.value && this.processor) {
      return {
        model: this.visionModel.value,
        processor: this.processor,
      };
    }

    this.log.debug("Loading CLIP vision model");
    const modelName = this.modelTypeToName(CURRENT_MODEL);
    if (!this.visionModel.value) {
      this.visionModel.value = await CLIPVisionModelWithProjection.from_pretrained(modelName, {
        progress_callback: progressCallback,
      });
    }

    if (!this.processor) {
      const processor = await AutoProcessor.from_pretrained(modelName, {
        progress_callback: progressCallback,
      });

      this.processor = processor;
    }

    return {
      model: this.visionModel.value,
      processor: this.processor,
    };
  }

  async encodeText(text: string): Promise<Embedding> {
    const { tokenizer, model } = await this.getTextModel();
    const textInputs = await tokenizer(text, { padding: true, truncation: true });
    const { text_embeds } = (await model(textInputs)) as { text_embeds: Tensor };
    const embedding = text_embeds.flatten().tolist();
    return {
      value: embedding,
      source: CURRENT_MODEL,
    };
  }

  async encodeImage(imagePath: string): Promise<Embedding> {
    const { model, processor } = await this.getVisionModel();
    const image = await RawImage.fromURL(imagePath);
    const imageInputs = await processor(image);
    const { image_embeds } = (await model(imageInputs)) as { image_embeds: Tensor };
    const embedding = image_embeds.flatten().tolist();
    return {
      value: embedding,
      source: CURRENT_MODEL,
    };
  }

  async encodeImageBatch(imagePaths: string[]): Promise<Embedding[]> {
    const { model, processor } = await this.getVisionModel();
    const images = await Promise.all(imagePaths.map((path) => RawImage.fromURL(path)));
    const imageInputs = await processor(images);
    const { image_embeds } = (await model(imageInputs)) as { image_embeds: Tensor };
    return image_embeds.tolist().map((embedding) => ({
      value: embedding,
      source: CURRENT_MODEL,
    }));
  }

  private modelTypeToName(type: ClipEmbeddingModelType) {
    // some of these map to different repos, thats because the original repos
    // aren't in the onnx format, so we have to use alternatives.
    switch (type) {
      case ClipEmbeddingModelType.OPENAI__CLIP_VIT_BASE_PATCH32: {
        return "Xenova/clip-vit-base-patch32";
      }
      case ClipEmbeddingModelType.OPENAI__CLIP_VIT_BASE_PATCH16: {
        return "Xenova/clip-vit-base-patch16";
      }
      default: {
        throw new Error(`Unknown model type: ${type}`);
      }
    }
  }
}
