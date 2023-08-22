import { ChannelCredentials } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { config } from '../../config.js';
import { SolomonServiceClient } from '../../generated/solomon.client.js';
import { type OCR, Vector } from '../../generated/solomon.js';

@Injectable()
export class SolomonService {
  private solomonService = new SolomonServiceClient(
    new GrpcTransport({
      host: 'localhost:50051',
      channelCredentials: ChannelCredentials.createInsecure(),
    }),
  );

  async getFileVector(file: { path: string }) {
    const { vector } = await this.solomonService.getVector({
      input: {
        oneofKind: 'file_path',
        file_path: file.path,
      },
    }).response;

    if (!vector) throw new Error('No vector returned from Solomon');
    return vector;
  }

  async getTextVector(text: string) {
    const { vector } = await this.solomonService.getVector({
      input: {
        oneofKind: 'text_input',
        text_input: text,
      },
    }).response;

    if (!vector) throw new Error('No vector returned from Solomon');
    return vector;
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

  vectorToBuffer(vector: Vector) {
    const array = Vector.toBinary(vector);
    return Buffer.from(array);
  }

  bufferToVector(buffer: Buffer) {
    return Vector.fromBinary(buffer);
  }
}
