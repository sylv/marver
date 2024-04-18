import { Injectable, Logger } from "@nestjs/common";
import { createHash } from "crypto";
import { existsSync } from "fs";
import { mkdir, open, rename, unlink } from "fs/promises";
import { dirname, join } from "path";
import { config } from "../../config";
import { SERVER_INFO } from "../../constants";
import { dedupe } from "../../helpers/dedupe";
import bytes from "bytes";

export interface DownloadOptions {
  url: string;
  path: string;
  hash?: string;
}

@Injectable()
export class DownloadService {
  private static readonly USER_AGENT = `marver/${SERVER_INFO.version}; ${SERVER_INFO.homepage}`;
  private logger = new Logger(DownloadService.name);
  private cachePath = join(config.metadata_dir, "remote");

  async ensureMany(options: DownloadOptions[]): Promise<string[]> {
    return Promise.all(options.map((o) => this.ensure(o)));
  }

  @dedupe
  async ensure(options: DownloadOptions): Promise<string> {
    const targetPath = join(this.cachePath, options.path);
    const exists = existsSync(targetPath);
    if (exists) return targetPath;

    const targetDir = dirname(targetPath);
    if (targetDir !== this.cachePath) {
      await mkdir(targetDir, { recursive: true });
    }

    this.logger.log(`Downloading ${options.url} to ${targetPath}`);
    const filepartPath = `${targetPath}.part`;
    let hash = createHash("sha256");

    const handle = await open(filepartPath, "a+");
    const stat = await handle.stat();

    const headers = new Headers({ "User-Agent": DownloadService.USER_AGENT });

    if (stat.size > 0) {
      this.logger.debug(`Resuming download using ${filepartPath} (${bytes(stat.size)})`);
      const stream = handle.createReadStream({ autoClose: false });
      for await (const chunk of stream) {
        hash.update(chunk);
      }

      headers.set("Range", `bytes=${stat.size}-`);
    }

    const response = await fetch(options.url, {
      headers: headers,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to download ${targetPath} (${response.status}): ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    if (stat.size !== 0 && response.status !== 206) {
      this.logger.warn(`Error occured resuming download for ${targetPath}, starting from scratch`);
      await handle.truncate(0);
      hash = createHash("sha256");
    }

    const writeStream = handle.createWriteStream({ start: stat.size });
    for await (const chunk of response.body) {
      writeStream.write(chunk);
      hash.update(chunk);
    }

    await handle.close();

    const digest = hash.digest("hex");
    if (options.hash) {
      if (digest !== options.hash) {
        await unlink(filepartPath);
        throw new Error(`Hash mismatch for ${targetPath}: expected ${options.hash}, got ${digest}`);
      } else {
        this.logger.debug(`Hash verified for ${targetPath}`);
      }
    }

    await rename(filepartPath, targetPath);
    this.logger.debug(`Downloaded ${targetPath}`);
    return targetPath;
  }
}
