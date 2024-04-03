import { ChannelCredentials } from "@grpc/grpc-js";
import { Injectable } from "@nestjs/common";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { readFile } from "node:fs/promises";
import { RehoboamServiceClient } from "../../@generated/rehoboam.client.js";
import { config } from "../../config.js";

@Injectable()
export class RehoboamService {
  private rehoboamClient = new RehoboamServiceClient(
    new GrpcTransport({
      host: "localhost:50033",
      channelCredentials: ChannelCredentials.createInsecure(),
    }),
  );

  async detectFaces(file: { path: string }) {
    if (!config.ocr.enabled) throw new Error("OCR is disabled");
    // todo: use thumbnail of image if it exists
    // todo: downscale image if no thumbnail and use that if the image is large
    const bytes = await readFile(file.path);
    // todo: batch multiple calls
    const { faces } = await this.rehoboamClient.extractFaces({
      images: [bytes],
    }).response;

    const filtered = [];
    for (const face of faces) {
      if (face.confidence < config.face_detection.min_face_score) continue;
      filtered.push(face);
    }

    return filtered;
  }
}
