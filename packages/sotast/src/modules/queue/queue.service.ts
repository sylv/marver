import { Collection } from '@discordjs/collection';
import { MikroORM } from '@mikro-orm/core';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { EntityManager, EntityRepository } from '@mikro-orm/better-sqlite';
import { RequestContext, type ObjectQuery } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { randomInt } from 'crypto';
import { stat } from 'fs/promises';
import ms from 'ms';
import PQueue from 'p-queue';
import { setTimeout } from 'timers';
import { setTimeout as sleep } from 'timers/promises';
import { config } from '../../config.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { isCorruptFileError, isNetworkError, isUnavailableFileError } from './error-utils.js';
import { JobState, JobStateEntity } from './job-state.entity.js';
import { QUEUE_KEY, type QueueKeyValue, type QueueOptions } from './queue.decorator.js';

// todo: cleanupMethod is never used
export interface LoadedQueue {
  method: (entity: FileEntity, parentOutput?: unknown) => Promise<unknown>;
  meta: QueueOptions;
  limiter: PQueue;
  pendingFileIds: Set<string>;
  parent?: LoadedQueue;
  children?: LoadedQueue[];
}

@Injectable()
export class QueueService implements OnApplicationBootstrap {
  @InjectRepository(JobStateEntity) private jobStateRepo: EntityRepository<JobStateEntity>;
  @InjectRepository(FileEntity) private fileRepo: EntityRepository<FileEntity>;

  private readonly queues = new Collection<string, LoadedQueue>();
  private readonly log = new Logger(QueueService.name);
  constructor(
    private discoveryService: DiscoveryService,
    private orm: MikroORM,
    private em: EntityManager,
  ) {}

  async onApplicationBootstrap() {
    if (config.disable_tasks) return;
    const methods =
      await this.discoveryService.providerMethodsWithMetaAtKey<QueueKeyValue>(QUEUE_KEY);

    // sort by parents first
    methods.sort((a, b) => {
      if (a.meta.parentType && !b.meta.parentType) return 1;
      if (!a.meta.parentType && b.meta.parentType) return -1;
      return 0;
    });

    for (const method of methods) {
      const concurrency = method.meta.thirdPartyDependant ? 1 : method.meta.targetConcurrency;
      const withMethod: LoadedQueue = {
        method: method.discoveredMethod.handler.bind(method.discoveredMethod.parentClass.instance),
        limiter: new PQueue({ concurrency: concurrency }),
        pendingFileIds: new Set(),
        meta: method.meta,
      };

      if (method.meta.parentType) {
        const parent = this.queues.get(method.meta.parentType);
        if (!parent) {
          throw new Error(
            `Parent queue "${method.meta.parentType}" not found for "${method.meta.type}"`,
          );
        }

        if (!parent.children) parent.children = [];
        parent.children.push(withMethod);
        withMethod.parent = parent;
      }

      this.queues.set(withMethod.meta.type, withMethod);
    }

    for (const queueHandler of this.queues.values()) {
      void this.scanQueue(queueHandler);
    }
  }

  private async scanQueue(queue: LoadedQueue) {
    // todo: clump jobs for the same file into the same time frame to avoid sporadic file reads
    // that will result in things like rclone caching to be more effective on slow network mounts,
    // because we'd read the same file 5 times in a row instead of over the course of a day.
    // it might even make sense to have a config option that operates on a single file at a time, waiting until
    // all jobs for that file are complete before moving to the next one. that could help in a lot of situations
    const fetchCount = queue.meta.targetConcurrency * 4;
    await queue.limiter.onSizeLessThan(fetchCount / 2);

    // todo: let @QueueHandlers have a "revision" property that is
    // included on the result. if the job has run but errored out w/ max retries,
    // retry the job if the revision number has changed.

    let hasMore = null;
    const em = this.orm.em.fork();
    await RequestContext.create(em, async () => {
      const query: ObjectQuery<FileEntity> = {
        $and: [
          {
            // don't run a job if its already running/scheduled
            id: {
              $nin: [...queue.pendingFileIds],
            },
          },
          {
            // don't run a job if it has already run for that file
            id: {
              $nin: this.jobStateRepo
                .createQueryBuilder()
                .select('file_id')
                .where({
                  type: queue.meta.type,
                })
                .getKnexQuery() as any,
            },
          },
        ],
      };

      if (queue.meta.fileFilter) {
        // don't run if the file filter doesn't match
        query.$and!.push(queue.meta.fileFilter);
      }

      // todo: if there are >100 job results for a queue type, pause and wait for the
      // children to catch up before doing more.

      // todo: we should only run the parent if the children want to run on that file.
      if (queue.parent) {
        // only run if the parent has run successfully
        query.$and!.push({
          id: {
            $in: this.jobStateRepo
              .createQueryBuilder()
              .select('file_id')
              .where({
                type: queue.parent.meta.type,
                state: JobState.Completed,
                result: { $ne: null },
              })
              .getKnexQuery() as any,
          },
        });
      }

      const [files, filesTotal] = await this.fileRepo.findAndCount(query, {
        limit: fetchCount,
        populate: ['jobStates', ...((queue.meta.populate ?? []) as any[])],
        orderBy: { size: 'ASC' },
        populateWhere: {
          // only load the job state for this queue type and the parent (so we can get the job data)
          jobStates: {
            type: {
              $in: queue.parent ? [queue.meta.type, queue.parent.meta.type] : [queue.meta.type],
            },
          },
        },
      });

      for (const file of files) {
        queue.pendingFileIds.add(file.id);
        if (queue.parent) {
          const parentJobState = file.jobStates.getItems().find((jobState) => {
            return jobState.type === queue.parent!.meta.type;
          });

          if (!parentJobState) {
            throw new Error(
              `Parent queue "${queue.parent.meta.type}" not found for "${queue.meta.type}"`,
            );
          }

          if (!parentJobState.result) {
            throw new Error(
              `Parent queue "${queue.parent.meta.type}" has no result for "${queue.meta.type}"`,
            );
          }

          void queue.limiter.add(() => this.runJob(queue, file, parentJobState.result));
        } else {
          void queue.limiter.add(() => this.runJob(queue, file));
        }
      }

      hasMore = filesTotal > files.length;
    });

    if (!hasMore) {
      const sleepFor = randomInt(15000, 30000);
      this.log.debug(
        `No more files to process for queue ${queue.meta.type}, sleeping for ${ms(sleepFor)}...`,
      );
      await sleep(sleepFor);
    }

    process.nextTick(() => {
      void this.scanQueue(queue);
    });
  }

  private async runJob(queueHandler: LoadedQueue, file: FileEntity, parentOutput?: unknown) {
    if (!file.path || !file.id) {
      throw new Error('File is not loaded correctly');
    }

    const start = performance.now();
    this.log.debug(`Starting ${queueHandler.meta.type} on "${file.path}"...`);

    let jobState = file.jobStates
      .getItems()
      .find((jobState) => jobState.type === queueHandler.meta.type);

    if (jobState) {
      jobState.retries++;
    } else {
      jobState = this.jobStateRepo.create(
        {
          file: file,
          type: queueHandler.meta.type,
          retries: 0,
          state: JobState.Completed,
          executedAt: new Date(),
        },
        { persist: false },
      );
    }

    try {
      const result = await queueHandler.method(file, parentOutput);
      const keepResult = !!queueHandler.children; // only parent queues need to store their result for children to consume

      jobState.result = keepResult ? result : null;
      jobState.state = JobState.Completed;
      jobState.executedAt = new Date();

      await this.em.persistAndFlush(jobState);

      // the concurrency can be lowered during errors, or at startup as a warm-up period.
      // we want to make sure a successful job will restore the concurrency to the target.
      queueHandler.limiter.concurrency = queueHandler.meta.targetConcurrency;

      // help diagnose slow jobs
      const duration = performance.now() - start;
      if (duration > 5000) {
        const humanDuration = ms(duration);
        this.log.warn(
          `Job ${queueHandler.meta.type} on "${file.path}" took ${humanDuration} to complete.`,
        );
      }
    } catch (error: any) {
      jobState.state = JobState.Failed;

      const isUnavailable = isUnavailableFileError(error);
      const isNetwork = isNetworkError(error);
      const isCorrupt = isCorruptFileError(error);
      if (isUnavailable) {
        // if the file exists on disk, its probably a queue related error (eg, unsupported file type)
        // so we mark this job as failed. if it does not exist, we mark as unavailable.
        const exists = await stat(file.path).catch(() => false);
        if (!exists) {
          // todo: check if the source is unavailable entirely (ideally, detect the mount path and check that,
          // but crawling up the path until we find a mount point that is mounted might not be awful) and if so,
          // mark all files in that source as unavailable until it comes back. plex does something similar to gracefully handle
          // unavailable network mounts or drives that are unplugged, etc.
          file.unavailable = true;
          await this.em.persistAndFlush(file);
          return;
        }

        // the job failed, so we just store that so it won't run again.
        jobState.errorMessage = error.message;
        await this.em.persistAndFlush(jobState);
        return;
      } else if (isCorrupt) {
        file.corrupted = true;
        jobState.errorMessage = `CORRUPT_FILE_ERROR: ${error.message}`;
        await this.em.persistAndFlush([jobState, file]);
        return;
      } else if (isNetwork) {
        // network errors are annoying, we have to pause the entire queue and wait a bit before we retry.
        const sleepFor = randomInt(ms('1m'), ms('5m'));

        jobState.errorMessage = `NETWORK_ERROR: ${error.message}`;
        jobState.retryAfter = Date.now() + sleepFor;
        await this.em.persistAndFlush([jobState, file]);

        if (queueHandler.limiter.isPaused) return;

        queueHandler.limiter.pause();
        queueHandler.limiter.concurrency = 1;

        const sleepForHuman = ms(sleepFor);
        this.log.error(
          `Job ${queueHandler.meta.type} on "${file.path}" errored with a network error, sleeping for ${sleepForHuman} then retrying...`,
        );

        setTimeout(() => {
          queueHandler.limiter.start();
        }, sleepFor).unref();
        return;
      } else {
        this.log.error(error, error.stack);
        jobState.errorMessage = error.message;
        await this.em.persistAndFlush(jobState);
      }
    } finally {
      queueHandler.pendingFileIds.delete(file.id);
    }
  }
}
