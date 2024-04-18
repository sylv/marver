import { existsSync } from "fs";
import { join } from "path";
import { Injectable } from "@nestjs/common";
import { FaceRecognition } from "@ryanke/rehoboam";
import Zip from "adm-zip";
import { config } from "../../config";
import { dedupe } from "../../helpers/dedupe";
import { DownloadService } from "../download/download.service";

const ZIP_SHA256 = "80ffe37d8a5940d59a7384c201a2a38d4741f2f3c51eef46ebb28218a7b0ca2f";
const ZIP_URL = "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip";

@Injectable()
export class FaceService {
  private _faceRec?: FaceRecognition;
  constructor(private downloadService: DownloadService) {}

  async detectFaces(imagePath: string) {
    const faceRec = await this.getFaceRecognition();
    const faces = await faceRec.predict(imagePath);
    return faces.filter((face) => face.prediction.score >= config.face_detection.min_face_score);
  }

  @dedupe
  private async ensureModels() {
    const basePath = join(config.metadata_dir, "remote", "facerec");
    const detPath = join(basePath, "detection.onnx");
    const embedPath = join(basePath, "embedding.onnx");

    if (existsSync(detPath) && existsSync(embedPath)) {
      return {
        detectionPath: detPath,
        embeddingPath: embedPath,
      };
    }

    const zipPath = await this.downloadService.ensure({
      path: "facerec/buffalo_l.zip",
      url: ZIP_URL,
      hash: ZIP_SHA256,
    });

    const zip = new Zip(zipPath);
    const zipEntries = zip.getEntries();
    const detEntry = zipEntries.find((entry) => entry.entryName.startsWith("det_"));
    const embedEntry = zipEntries.find((entry) => entry.entryName.startsWith("w600k"));
    if (!detEntry || !embedEntry) {
      throw new Error("Could not find model files in zip");
    }

    zip.extractEntryTo(detEntry, basePath, false, true, false, "detection.onnx");
    zip.extractEntryTo(embedEntry, basePath, false, true, false, "embedding.onnx");

    return {
      detectionPath: detPath,
      embeddingPath: embedPath,
    };
  }

  @dedupe
  private async getFaceRecognition(): Promise<FaceRecognition> {
    if (this._faceRec) return this._faceRec;
    const { detectionPath, embeddingPath } = await this.ensureModels();
    this._faceRec = new FaceRecognition({
      detectionModelPath: detectionPath,
      embeddingModelPath: embeddingPath,
    });

    return this._faceRec;
  }
}
