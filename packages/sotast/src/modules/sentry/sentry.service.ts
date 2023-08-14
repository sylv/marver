import { ChannelCredentials } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { config } from '../../config.js';
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

  async *detectFaces(file: { path: string }) {
    const { faces } = await this.sentryService.detectFaces({
      file_path: file.path,
    }).response;

    for (const face of faces) {
      if (face.confidence < config.face_detection.min_face_score) continue;
      yield face;
    }
  }

  vectorToBuffer(vector: Vector) {
    const array = Vector.toBinary(vector);
    return Buffer.from(array);
  }

  bufferToVector(buffer: Buffer) {
    return Vector.fromBinary(buffer);
  }
}
