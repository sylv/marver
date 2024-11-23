import { Inject, Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { once } from "node:events";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, opendir, stat, unlink } from "node:fs/promises";
import ms from "ms";
import { join } from "node:path";
import { config } from "../../config";
import { CACHE_OPTIONS_KEY, type CacheOptions } from "./cache-options.interface";

interface CachedFile {
  size: number;
  lastAccessedAt: number;
}

@Injectable()
export class CacheService implements OnModuleInit {
  @Inject(CACHE_OPTIONS_KEY) private readonly options: CacheOptions;
  private files = new Map<string, CachedFile>();
  private rootDir: string;
  private totalSize = 0;
  private logger = new Logger(CacheService.name);
  private scheduleTimeout?: NodeJS.Timeout;

  async onModuleInit() {
    this.rootDir = join(config.cache_dir, this.options.name);
    await mkdir(this.rootDir, { recursive: true });
    await this.loadFiles();
  }

  private async loadFiles() {
    const handle = await opendir(this.rootDir, { bufferSize: 200 });
    for await (const dirent of handle) {
      if (!dirent.isFile()) continue;
      const filePath = join(this.rootDir, dirent.name);
      const info = await stat(filePath);
      this.totalSize += info.size;
      this.files.set(dirent.name, {
        size: info.size,
        lastAccessedAt: info.atimeMs || info.mtimeMs || info.birthtimeMs,
      });
    }

    this.sweep();
  }

  public createWriteStream(name: string) {
    if (name.length !== 64) throw new Error("Expected cache key to be a 64-character hex string");
    const existing = this.files.get(name);
    if (existing) {
      this.files.delete(name);
      this.totalSize -= existing.size;
    }

    const filePath = join(this.rootDir, name);
    const stream = createWriteStream(filePath, { flags: "w" });
    stream.on("finish", () => {
      this.totalSize += stream.bytesWritten;
      this.files.set(name, {
        size: stream.bytesWritten,
        lastAccessedAt: Date.now(),
      });

      this.sweep();
    });

    return stream;
  }

  public async createReadStream(name: string) {
    const info = this.files.get(name);
    if (!info) return null;

    try {
      const filePath = join(this.rootDir, name);
      const stream = createReadStream(filePath);
      await once(stream, "open");
      this.files.set(name, Object.assign(info, { lastAccessedAt: Date.now() }));
      return stream;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        this.files.delete(name);
        this.totalSize -= info.size;
        return null;
      }

      throw error;
    }
  }

  /**
   * Sweep the cache, with some debounce to prevent rapid sweeping.
   */
  @Interval(ms("5min"))
  private sweep() {
    if (this.scheduleTimeout) clearTimeout(this.scheduleTimeout);
    if (this.totalSize <= this.options.maxSize && this.files.size <= this.options.maxItems) {
      // if we're under the limit, theres no reason to sweep.
      return;
    }

    this.scheduleTimeout = setTimeout(() => this.forceSweep(), 1000);
  }

  /**
   * Sweep the cache now, ignoring whether we need to and bypassing the debounce.
   * This should only be called by `scheduleSweep`.
   */
  private async forceSweep() {
    try {
      this.logger.debug(`Sweeping cache ${this.options.name}`);
      const start = performance.now();
      let deleted = 0;

      const sortedByLastAccessedAsc = [...this.files.entries()].sort(
        (a, b) => a[1].lastAccessedAt - b[1].lastAccessedAt,
      );

      // * 0.9 is used so we once we hit the limit, we aren't constantly sweeping.
      while (this.totalSize > this.options.maxSize * 0.9 || this.files.size > this.options.maxItems * 0.9) {
        const [name, info] = sortedByLastAccessedAsc.shift()!;
        const filePath = join(this.rootDir, name);
        await unlink(filePath);
        this.files.delete(name);
        this.totalSize -= info.size;
        deleted++;
        this.logger.debug(`Pruned ${name} from cache ${this.options.name}`);
      }

      if (deleted !== 0) {
        const duration = performance.now() - start;
        this.logger.debug(`Pruned ${deleted} files from cache ${this.options.name} in ${duration}ms`);
      }
    } catch (error) {
      this.logger.fatal(error);
      process.exit(1);
    }
  }
}
