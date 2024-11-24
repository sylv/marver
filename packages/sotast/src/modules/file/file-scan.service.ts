import { MikroORM } from "@mikro-orm/core";
import { CreateRequestContext, EntityManager, EntityRepository, type Loaded } from "@mikro-orm/libsql";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, Logger, type OnApplicationBootstrap } from "@nestjs/common";
import { CronExpression } from "@nestjs/schedule";
import { opendir, stat } from "fs/promises";
import PQueue from "p-queue";
import { dirname, extname, join } from "path";
import { performance } from "perf_hooks";
import { config } from "../../config.js";
import { SUPPORTED_EXTENSIONS } from "../../constants.js";
import { filePathToDisplayName } from "../../helpers/filePathToDisplayName.js";
import { FileEntity } from "./entities/file.entity.js";
import { PublicCron } from "../task/public-cron.decorator.js";

// todo: increase directoryQueue/fileQueue concurrency for high latency mounts
@Injectable()
export class FileScanService implements OnApplicationBootstrap {
  @InjectRepository(FileEntity) private fileRepo: EntityRepository<FileEntity>;

  private directoryQueue = new PQueue({ concurrency: 8 });
  private fileQueue = new PQueue({ concurrency: 16 });
  private staged = 0;
  private log = new Logger(FileScanService.name);
  private lastPersist = Date.now();
  private skipped = new Set<string>();

  constructor(
    protected orm: MikroORM,
    private em: EntityManager,
  ) {}

  @CreateRequestContext()
  async onApplicationBootstrap() {
    const fileCount = await this.fileRepo.count();
    if (fileCount === 0) {
      this.log.log("No files found, starting scan");
      this.scan();
    }
  }

  @PublicCron(CronExpression.EVERY_12_HOURS, {
    name: "Scan Files",
    description: "Index new files and mark missing files as unavailable",
  })
  @CreateRequestContext()
  async scan() {
    const start = performance.now();
    const lastCheckedAt = new Date();
    for (const sourceDir of config.source_dirs) {
      this.directoryQueue.add(() => this.scanDirectory(sourceDir, sourceDir));
    }

    // flush any remaining files only if we're at the root directory
    await this.directoryQueue.onIdle();
    await this.fileQueue.onIdle();
    await this.persist();

    // mark any files in the directory that weren't scanned as unavailable
    await this.fileRepo
      .createQueryBuilder()
      .update({
        unavailable: true,
      })
      .where({
        checkedAt: { $lt: lastCheckedAt },
      });

    // todo: reset task cooldowns. when tasks have no files to process, they sleep for awhile.
    // if we reset them it'll feel more responsive when new files are added
    const duration = performance.now() - start;
    this.log.log(`Scanned source in ${duration}ms`);
    if (this.skipped.size) {
      this.log.debug(`Skipped ${this.skipped.size} unknown extensions "${[...this.skipped].join(", ")}"`);
      this.skipped = new Set();
    }
  }

  /**
   * Scan a single directory.
   * @warning This will add children directories to the queue, so when it returns it may not be done scanning.
   * You should await this.queue.onIdle() to ensure all files have been scanned.
   */
  private async scanDirectory(sourceDir: string, dirPath: string) {
    // todo: skip this directory and children directories if a .marverignore file exists
    const start = performance.now();
    const dir = await opendir(dirPath, { bufferSize: 1000 });
    const existingFiles = await this.fileRepo.find(
      { directory: dirPath },
      {
        fields: ["id", "path", "info", "unavailable", "checkedAt"],
        filters: false,
      },
    );

    for await (const dirent of dir) {
      const path = join(dirPath ?? config.source_dirs, dirent.name);

      if (dirent.isDirectory()) {
        // scan directories by queuing them up
        this.directoryQueue.add(() => this.scanDirectory(sourceDir, path));
      } else if (dirent.isFile()) {
        // scan files
        this.fileQueue.add(() => this.scanFile(path, existingFiles));
      }
    }

    const duration = performance.now() - start;
    this.log.debug(`Read files in "${dirPath}" in ${duration}ms`);
  }

  private async scanFile(
    path: string,
    existingFiles: Loaded<FileEntity, never, "id" | "path" | "info" | "unavailable" | "checkedAt">[],
  ) {
    const existing = existingFiles.find((file) => file.path === path);
    if (existing) {
      existing.checkedAt = new Date();
      existing.unavailable = false;
      this.staged++;
      if (this.shouldPersist) {
        await this.persist();
      }

      return;
    }

    const ext = extname(path).slice(1).toLowerCase();
    if (!ext) {
      this.log.debug(`Ignoring file with no extension "${path}"`);
      return;
    }

    const info = await stat(path).catch((error) => {
      // if the file was deleted while we were scanning
      // also works around some smb weirdness where it incorrectly uppercases the extension on a file which breaks case sensitive lookups
      this.log.error(`Failed to stat file "${path}"`, error);
      return null;
    });

    if (!info) return;
    // on WSL birthtime is always 0, so we use mtime instead
    const birthtime = info.birthtimeMs === 0 ? info.mtime : info.birthtime;
    const file = this.fileRepo.create({
      path: path,
      extension: ext,
      directory: dirname(path),
      displayName: filePathToDisplayName(path),
      size: info.size,
      modifiedAt: info.mtime,
      createdAt: birthtime,
      info: {},
    });

    // there is no point in tracking files that we don't know how to handle
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      if (this.skipped.size > 100) return;
      this.skipped.add(ext);
      return;
    }

    this.em.persist(file);
    this.staged++;
    if (this.shouldPersist) {
      await this.persist();
    }
  }

  get shouldPersist() {
    if (this.staged >= 1000) return true;
    const lastPersistedAgo = Date.now() - this.lastPersist;
    if (lastPersistedAgo > 10000) return true;
    return false;
  }

  async persist() {
    const count = this.staged;
    this.staged = 0;
    this.lastPersist = Date.now();
    await this.em.flush();
    this.em.clear();
    this.log.debug(`Persisted ${count} files`);
  }
}
