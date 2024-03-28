import { CreateRequestContext, EntityManager, EntityRepository, type Loaded } from '@mikro-orm/better-sqlite';
import { MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { opendir, stat } from 'node:fs/promises';
import PQueue from 'p-queue';
import { basename, join } from 'node:path';
import { performance } from 'perf_hooks';
import { config } from '../../config.js';
import { shouldCreateCollection } from '../../helpers/should-create-collection.js';
import { CollectionEntity } from '../collection/collection.entity.js';
import { PublicCron } from '../task/public-cron.decorator.js';
import { FileEntity } from './entities/file.entity.js';

// todo: increase directoryQueue/fileQueue concurrency for high latency mounts
@Injectable()
export class FileScanService implements OnApplicationBootstrap {
  @InjectRepository(FileEntity) private fileRepo: EntityRepository<FileEntity>;
  @InjectRepository(CollectionEntity) private collectionRepo: EntityRepository<CollectionEntity>;

  private directoryQueue = new PQueue({ concurrency: 8 });
  private fileQueue = new PQueue({ concurrency: 16 });
  private staged = 0;
  private log = new Logger(FileScanService.name);
  private lastPersist = Date.now();

  constructor(
    protected orm: MikroORM,
    private em: EntityManager,
  ) {}

  async onApplicationBootstrap() {
    const fileCount = await this.fileRepo.count();
    if (fileCount === 0) {
      this.log.log('No files found, starting scan');
      this.scan();
    }
  }

  @PublicCron(CronExpression.EVERY_12_HOURS, {
    name: 'Scan Files',
    description: 'Index new files and mark missing files as unavailable',
  })
  @CreateRequestContext()
  async scan() {
    const start = performance.now();
    const lastCheckedAt = new Date();
    for (const sourceDir of config.source_dirs) {
      this.directoryQueue.add(() => this.scanDirectory(sourceDir, undefined, sourceDir));
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
  }

  /**
   * Scan a single directory.
   * @warning This will add children directories to the queue, so when it returns it may not be done scanning.
   * You should await this.queue.onIdle() to ensure all files have been scanned.
   */
  private async scanDirectory(
    sourceDir: string,
    parentCollection: CollectionEntity | undefined,
    dirPath: string,
  ) {
    // todo: skip this directory and children directories if a .marverignore file exists
    const start = performance.now();
    const dir = await opendir(dirPath, { bufferSize: 1000 });
    const existingFiles = await this.fileRepo.find(
      { directory: dirPath },
      {
        fields: ['id', 'path', 'info', 'unavailable', 'checkedAt'],
        filters: false,
      },
    );

    let collection: CollectionEntity | undefined;
    const dirname = basename(dirPath);
    if (shouldCreateCollection(dirname) && sourceDir !== dirPath) {
      const existingCollection = await this.collectionRepo.findOne({
        $or: [{ path: dirPath }, { name: dirPath }],
      });

      if (existingCollection) {
        collection = existingCollection;
      } else {
        collection = this.collectionRepo.create(
          {
            name: dirname,
            path: dirPath,
            parent: parentCollection,
            generated: true,
          },
          { persist: true },
        );
      }
    }

    console.log({ collection });

    for await (const dirent of dir) {
      const path = join(dirPath ?? config.source_dirs, dirent.name);

      if (dirent.isDirectory()) {
        // scan directories by queuing them up
        this.directoryQueue.add(() => this.scanDirectory(sourceDir, collection, path));
      } else if (dirent.isFile()) {
        // scan files
        this.fileQueue.add(() => this.scanFile(collection, path, existingFiles));
      }
    }

    const duration = performance.now() - start;
    this.log.debug(`Read files in "${dirPath}" in ${duration}ms`);
  }

  private async scanFile(
    collection: CollectionEntity | undefined,
    path: string,
    existingFiles: Loaded<FileEntity, never, 'id' | 'path' | 'info' | 'unavailable' | 'checkedAt'>[],
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

    // on WSL birthtime is always 0, so we use mtime instead
    const info = await stat(path);
    const birthtime = info.birthtimeMs === 0 ? info.mtime : info.birthtime;
    const file = this.fileRepo.create({
      path: path,
      size: info.size,
      modifiedAt: info.mtime,
      createdAt: birthtime,
      info: {},
    });

    if (collection) {
      collection.files.add(file);
    }

    // there is no point in tracking files that we don't know how to handle
    if (!file.isSupportedMimeType) {
      this.log.debug(`Skipping unknown file type: ${path}`);
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
    this.log.debug(`Persisted ${count} files`);
  }
}
