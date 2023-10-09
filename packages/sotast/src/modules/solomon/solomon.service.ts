import { ChannelCredentials } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { readFile } from 'fs/promises';
import type { OCR } from '../../@generated/core.js';
import { RehoboamServiceClient } from '../../@generated/rehoboam.client.js';
import { SolomonServiceClient } from '../../@generated/solomon.client.js';
import { config } from '../../config.js';

@Injectable()
export class SolomonService {
  private solomonService = new SolomonServiceClient(
    new GrpcTransport({
      host: 'localhost:50051',
      channelCredentials: ChannelCredentials.createInsecure(),
    }),
  );
  private rehoboamService = new RehoboamServiceClient(
    new GrpcTransport({
      host: 'localhost:50033',
      channelCredentials: ChannelCredentials.createInsecure(),
    }),
  );

  async getFileEmbedding(file: { path: string }) {
    // todo: use thumbnail of image if it exists
    // todo: downscale image if no thumbnail and use that if the image is large
    const bytes = await readFile(file.path);
    // todo: batch multiple calls
    const { embeddings } = await this.rehoboamService.encodeImage({
      images: [bytes],
    }).response;

    if (!embeddings || !embeddings[0]) throw new Error('No embedding returned');
    return embeddings[0];
  }

  async getTextEmbedding(text: string) {
    // todo: batch multiple calls
    const { embeddings } = await this.rehoboamService.encodeText({
      texts: [text],
    }).response;

    if (!embeddings || !embeddings[0]) throw new Error('No embedding returned');
    return embeddings[0];
  }

  async *detectFaces(file: { path: string }) {
    if (!config.ocr.enabled) throw new Error('OCR is disabled');
    const { faces } = await this.solomonService.detectFaces({
      file_path: file.path,
    }).response;

    for (const face of faces) {
      if (face.confidence < config.face_detection.min_face_score) continue;
      yield face;
    }
  }

  async getOCR(file: { path: string }) {
    if (!config.ocr.enabled) throw new Error('OCR is disabled');
    const { results } = await this.solomonService.getOCR({
      file_path: file.path,
    }).response;

    return this.mergeOCRResults(results);
  }

  private mergeOCRResults(results: OCR[]) {
    const merged: OCR[] = [];
    let skipNextMerge = false;
    for (const result of results) {
      if (result.confidence < config.ocr.min_word_score) {
        skipNextMerge = true;
        continue;
      }

      // if this word is close to the previous word, merge them
      // they must be within 15px horizontally and 4px vertically
      const lastWord = merged.at(-1);
      if (!lastWord) {
        merged.push(result);
        continue;
      }

      // don't merge if the confidence is too different or the last result was skipped
      // merging when the last result is skipped would create "sentences" that potentially missing words.
      const skipMerge = skipNextMerge || Math.abs(result.confidence - lastWord.confidence) > 0.3;
      if (skipMerge) {
        skipNextMerge = false;
        merged.push(result);
        continue;
      }

      const xDiff = Math.abs(result.bounding_box!.x1 - lastWord.bounding_box!.x2);
      const yDiff = Math.abs(result.bounding_box!.y1 - lastWord.bounding_box!.y1);
      if (xDiff < 30 && yDiff < 15) {
        lastWord.text += ' ' + result.text;
        // expand the bounding box to be the max of both
        lastWord.bounding_box!.x2 = Math.max(lastWord.bounding_box!.x2, result.bounding_box!.x2);
        lastWord.bounding_box!.y2 = Math.max(lastWord.bounding_box!.y2, result.bounding_box!.y2);
        lastWord.bounding_box!.x1 = Math.min(lastWord.bounding_box!.x1, result.bounding_box!.x1);
        lastWord.bounding_box!.y1 = Math.min(lastWord.bounding_box!.y1, result.bounding_box!.y1);
        continue;
      } else {
        merged.push(result);
      }
    }

    return merged;
  }
}
