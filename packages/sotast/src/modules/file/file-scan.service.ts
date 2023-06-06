import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { EntityManager, EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { opendir, stat } from 'fs/promises';
import PQueue from 'p-queue';
import { join } from 'path';
import { performance } from 'perf_hooks';
import { config } from '../../config.js';
import { File } from './entities/file.entity.js';

// todo: increase directoryQueue/fileQueue concurrency for high latency mounts
@Injectable()
export class FileScanService {
  @InjectRepository(File) private fileRepo: EntityRepository<File>;

  private directoryQueue = new PQueue({ concurrency: 8 });
  private fileQueue = new PQueue({ concurrency: 16 });
  private staged = 0;
  private logger = new Logger(FileScanService.name);
  private lastPersist = Date.now();

  constructor(protected orm: MikroORM, private em: EntityManager) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  @UseRequestContext()
  async scan() {
    const start = performance.now();
    const lastCheckedAt = new Date();
    for (const dir of config.source_dirs) {
      this.directoryQueue.add(() => this.scanDirectory(dir));
    }

    // flush any remaining files only if we're at the root directory
    await this.directoryQueue.onIdle();
    await this.fileQueue.onIdle();
    await this.persist();

    // mark any files in the directory that weren't scanned as unavailable
    await this.fileRepo
      .createQueryBuilder()
      .update({
        metadata: {
          unavailable: true,
        },
      })
      .where({
        ['path_dirname(path)']: config.source_dirs,
        metadata: {
          serverCheckedAt: { $lt: lastCheckedAt },
        },
      });

    const duration = performance.now() - start;
    this.logger.log(`Scanned source in ${duration}ms`);
  }

  /**
   * Scan a single directory.
   * @warning This will add children directories to the queue, so when it returns it may not be done scanning.
   * You should await this.queue.onIdle() to ensure all files have been scanned.
   */
  private async scanDirectory(directory: string) {
    const start = performance.now();
    const dir = await opendir(directory, { bufferSize: 1000 });
    const existingFiles = await this.fileRepo.find(
      { directory },
      {
        fields: ['id', 'path', 'metadata'],
        filters: false,
      }
    );

    for await (const dirent of dir) {
      const path = join(directory ?? config.source_dirs, dirent.name);
      if (dirent.isDirectory()) {
        // scan directories by queuing them up
        this.directoryQueue.add(() => this.scanDirectory(path));
      } else if (dirent.isFile()) {
        // scan files
        this.fileQueue.add(() => this.scanFile(path, existingFiles));
      }
    }

    const duration = performance.now() - start;
    this.logger.debug(`Read files in "${directory}" in ${duration}ms`);
  }

  private async scanFile(path: string, existingFiles: File[]) {
    const existing = existingFiles.find((file) => file.path === path);
    if (existing) {
      existing.metadata.serverCheckedAt = new Date();
      existing.metadata.unavailable = false;
      this.staged++;
      if (this.shouldPersist) {
        await this.persist();
      }

      return;
    }

    const info = await stat(path);
    // on WSL birthtime is always 0, so we use mtime instead
    const birthtime = info.birthtimeMs === 0 ? info.mtime : info.birthtime;
    const file = this.fileRepo.create({
      path: path,
      metadata: {
        size: info.size,
        serverCheckedAt: new Date(),
        serverCreatedAt: new Date(),
        diskModifiedAt: info.mtime,
        diskCreatedAt: birthtime,
        createdAt: birthtime,
      },
    });

    // there is no point in tracking files that we don't know how to handle
    if (!file.isKnownType) return;

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
    this.logger.debug(`Persisted ${count} files`);
  }
}
