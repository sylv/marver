import { ChannelCredentials } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { SentryServiceClient } from '../../generated/sentry.client.js';
import { Vector } from '../../generated/sentry.js';

@Injectable()
export class SentryService {
  private sentryService = new SentryServiceClient(
    new GrpcTransport({
      host: 'localhost:50051',
      channelCredentials: ChannelCredentials.createInsecure(),
    })
  );

  async getFileVector(file: { path: string }) {
    const { vector } = await this.sentryService.getVector({
      input: {
        oneofKind: 'file_path',
        file_path: file.path,
      },
    }).response;

    if (!vector) throw new Error('No vector returned from Sentry');
    return vector;
  }

  async getTextVector(text: string) {
    const { vector } = await this.sentryService.getVector({
      input: {
        oneofKind: 'text_input',
        text_input: text,
      },
    }).response;

    if (!vector) throw new Error('No vector returned from Sentry');
    return vector;
  }

  /**
   * Combines an array of vectors into a single vector using self-attention pooling, which should represent the overall
   * content of the input vectors.
   *
   * This function uses self-attention pooling to combine the input vectors into a single vector that captures the most
   * relevant information from each vector. Self-attention pooling is a type of pooling operation that uses an attention
   * mechanism to weight the contribution of each vector to the overall representation. This allows the pooling operation
   * to assign different weights to different vectors based on their relevance to the overall content, which could improve
   * the performance of search and classification tasks.
   */
  combineVectors(vectors: number[][]): number[] {
    const n = vectors.length;
    const d = vectors[0].length;
    const queries = vectors;
    const keys = vectors;
    const values = vectors;
    const scaledDotProducts = [];

    // Calculate scaled dot products
    for (let i = 0; i < n; i++) {
      const query = queries[i];
      const key = keys[i];
      let dotProduct = 0;
      for (let j = 0; j < d; j++) {
        dotProduct += query[j] * key[j];
      }
      scaledDotProducts.push(dotProduct / Math.sqrt(d));
    }

    // Calculate attention weights
    const attentionWeights = [];
    const expSum = scaledDotProducts.reduce((a, b) => a + Math.exp(b), 0);
    for (let i = 0; i < n; i++) {
      attentionWeights.push(Math.exp(scaledDotProducts[i]) / expSum);
    }

    // Calculate weighted sum
    const weightedSum = new Array(d).fill(0);
    for (let i = 0; i < n; i++) {
      const weight = attentionWeights[i];
      const value = values[i];
      for (let j = 0; j < d; j++) {
        weightedSum[j] += weight * value[j];
      }
    }

    return weightedSum;
  }

  vectorToBuffer(vector: Vector) {
    const array = Vector.toBinary(vector);
    return Buffer.from(array);
  }

  bufferToVector(buffer: Buffer) {
    return Vector.fromBinary(buffer);
  }
}
