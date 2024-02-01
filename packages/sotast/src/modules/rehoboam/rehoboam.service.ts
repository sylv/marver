import { Injectable } from '@nestjs/common';
import { RehoboamServiceClient } from '../../@generated/rehoboam.client.js';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';
import { readFile } from 'fs/promises';
import { config } from '../../config.js';

@Injectable()
export class RehoboamService {
  private rehoboamClient = new RehoboamServiceClient(
    new GrpcTransport({
      host: 'localhost:50033',
      channelCredentials: ChannelCredentials.createInsecure(),
    }),
  );

  async encodeImage(file: { path: string }) {
    // todo: use thumbnail of image if it exists
    // todo: downscale image if no thumbnail and use that if the image is large
    const bytes = await readFile(file.path);
    // todo: batch multiple calls
    const { embeddings } = await this.rehoboamClient.encodeImage({
      images: [bytes],
    }).response;

    if (!embeddings || !embeddings[0]) throw new Error('No embedding returned');
    return embeddings[0];
  }

  async encodeText(text: string) {
    // todo: batch multiple calls
    const { embeddings } = await this.rehoboamClient.encodeText({
      texts: [text],
    }).response;

    if (!embeddings || !embeddings[0]) throw new Error('No embedding returned');
    return embeddings[0];
  }

  async *detectFaces(file: { path: string }) {
    if (!config.ocr.enabled) throw new Error('OCR is disabled');
    // todo: use thumbnail of image if it exists
    // todo: downscale image if no thumbnail and use that if the image is large
    const bytes = await readFile(file.path);
    // todo: batch multiple calls
    const { faces } = await this.rehoboamClient.extractFaces({
      images: [bytes],
    }).response;

    for (const face of faces) {
      if (face.confidence < config.face_detection.min_face_score) continue;
      yield face;
    }
  }
}
