import { Collection } from '@discordjs/collection';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { EntityManager, EntityRepository } from '@mikro-orm/better-sqlite';
import { MikroORM, RequestContext, UseRequestContext, type FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomInt } from 'crypto';
import { stat } from 'fs/promises';
import ms from 'ms';
import PQueue from 'p-queue';
import { setTimeout } from 'timers';
import { setTimeout as sleep } from 'timers/promises';
import { config } from '../../config.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { isCorruptFileError, isNetworkError, isUnavailableFileError } from './error-utils.js';
import { type QueueChildOptions } from './job-child.decorator.js';
import { JobState, JobStateEntity } from './job-state.entity.js';
import { QUEUE_KEY, type QueueKeyValue, type QueueOptions } from './queue.decorator.js';

// todo: cleanupMethod is never used
export interface LoadedQueue {
  method: (entity: FileEntity) => Promise<unknown>;
  meta: QueueOptions;
  children: LoadedChildQueue[];
  queue: PQueue;
  queuedFileIds: Set<string>;
}

export interface LoadedChildQueue {
  method: (entity: FileEntity, parentResult: unknown) => Promise<void>;
  meta: QueueChildOptions;
  queue: PQueue;
  queuedFileIds: Set<string>;
}

@Injectable()
export class QueueService implements OnApplicationBootstrap {
  @InjectRepository(JobStateEntity) private jobStateRepo: EntityRepository<JobStateEntity>;
  @InjectRepository(FileEntity) private fileRepo: EntityRepository<FileEntity>;

  private readonly taskHandlers = new Collection<string, LoadedQueue>();
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
    for (const method of methods) {
      const concurrency = method.meta.thirdPartyDependant ? 1 : method.meta.targetConcurrency;
      const withMethod: LoadedQueue = {
        method: method.discoveredMethod.handler.bind(method.discoveredMethod.parentClass.instance),
        queue: new PQueue({ concurrency: concurrency }),
        queuedFileIds: new Set(),
        children: [],
        meta: method.meta,
      };

      this.taskHandlers.set(withMethod.meta.type, withMethod);

      const scanDelay = config.is_development ? 500 : 5000;
      setTimeout(() => {
        void this.scanForParentTasks(withMethod);
      }, scanDelay);
    }

    // const children = await this.discoveryService.providerMethodsWithMetaAtKey<TaskChildKey>(TASK_CHILD_KEY);
    // for (const child of children) {
    //   if (child.meta.parentType === undefined) {
    //     throw new Error(`Task ${TaskType[child.meta.type]} is a child task but has no parentType`);
    //   }

    //   const parent = this.taskHandlers.get(child.meta.parentType);
    //   if (!parent) {
    //     throw new Error(
    //       `Task ${TaskType[child.meta.type]} has parentType ${
    //         TaskType[child.meta.parentType]
    //       } but no parent task`,
    //     );
    //   }

    //   const withMethod: LoadedChildTask = {
    //     method: child.discoveredMethod.handler.bind(child.discoveredMethod.parentClass.instance),
    //     queue: new PQueue({ concurrency: child.meta.concurrency }),
    //     queued: new Set(),
    //     meta: child.meta,
    //   };

    //   parent.children.push(withMethod);
    //   // todo: re-enable
    //   // process.nextTick(() => {
    //   //   this.scanForChildTasks(withMethod);
    //   // });
    // }

    await this.cleanupTasks();
  }

  private async scanForParentTasks(taskHandler: LoadedQueue) {
    // todo: clump tasks for the same file into the same time frame to avoid sporadic file reads
    // that will result in things like rclone caching to be more effective on slow network mounts,
    // because we'd read the same file 5 times in a row instead of over the course of a day.
    // it might even make sense to have a config option that operates on a single file at a time, waiting until
    // all tasks for that file are complete before moving to the next one. that could help in a lot of situations
    const fetchCount = taskHandler.meta.targetConcurrency * 4;
    await taskHandler.queue.onSizeLessThan(fetchCount / 2);

    // todo: let @QueueHandlers have a "revision" property that is
    // included on the result. if the task has run but errored out w/ max retries,
    // retry the task if the revision number has changed.

    let hasMore = null;
    const em = this.orm.em.fork();
    await RequestContext.createAsync(em, async () => {
      const query: FilterQuery<FileEntity> = {
        $and: [
          taskHandler.meta.fileFilter,
          {
            // don't run a task if its already running/scheduled
            id: {
              $nin: [...taskHandler.queuedFileIds],
            },
          },
          {
            // don't run a task if it has already run for that file
            // (for parent tasks, or for tasks with lockTask enabled)
            id: {
              // types are wrong, this totally works.
              // (until an update breaks it silently)
              $nin: this.jobStateRepo
                .createQueryBuilder()
                .select('file_id')
                .where({
                  type: taskHandler.meta.type,
                })
                .getKnexQuery() as any,
            },
          },
        ],
      };

      if (taskHandler.children[0]) {
        // only run the parent task if one of the children wants to run
        query.$and!.push({
          $or: taskHandler.children.map((child) => child.meta.filter),
        });
      }

      const [files, filesTotal] = await this.fileRepo.findAndCount(query, {
        limit: fetchCount,
        populate: ['tasks', ...((taskHandler.meta.populate ?? []) as any[])],
      });

      for (const file of files) {
        taskHandler.queuedFileIds.add(file.id);
        void taskHandler.queue.add(() => this.runTask(taskHandler, file));
      }

      hasMore = filesTotal > files.length;
    });

    if (!hasMore) {
      const sleepFor = randomInt(15000, 30000);
      this.log.debug(
        `No more files to process for task ${taskHandler.meta.type}, sleeping for ${ms(
          sleepFor,
        )}...`,
      );
      await sleep(sleepFor);
    }

    process.nextTick(() => {
      void this.scanForParentTasks(taskHandler);
    });
  }

  // private async scanForChildTasks(taskHandler: LoadedChildTask) {
  //   const fetchCount = taskHandler.meta.concurrency * 4;
  //   await taskHandler.queue.onSizeLessThan(fetchCount / 2);

  //   let hasMore = null;
  //   const em = this.orm.em.fork();
  //   await RequestContext.createAsync(em, async () => {
  //     const [tasks, tasksTotal] = await this.taskRepo.findAndCount(
  //       {
  //         state: TaskState.Completed,
  //         type: taskHandler.meta.parentType,
  //         file: {
  //           $and: [
  //             taskHandler.meta.filter,
  //             {
  //               id: {
  //                 $nin: [...taskHandler.queued],
  //               },
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         limit: fetchCount,
  //         populate: [
  //           'file',
  //           ...((taskHandler.meta.populate?.map((field) => `file.${String(field)}`) as any[]) || []),
  //         ],
  //       }
  //     );

  //     for (const task of tasks) {
  //       const file = task.file.getEntity();
  //       taskHandler.queued.add(task.file.id);
  //       taskHandler.queue.add(() => this.runTask(taskHandler, file, task.result));
  //     }
  //     hasMore = tasksTotal > tasks.length;
  //   });

  //   if (!hasMore) {
  //     const sleepFor = randomInt(15000, 30000);
  //     this.log.debug(
  //       `No more files to process for child task ${TaskType[taskHandler.meta.type]}, sleeping for ${ms(
  //         sleepFor
  //       )}...`
  //     );
  //     await sleep(sleepFor);
  //   }

  //   this.scanForChildTasks(taskHandler);
  // }

  private async runTask(
    taskHandler: LoadedQueue | LoadedChildQueue,
    file: FileEntity,
    parentOutput?: unknown,
  ) {
    if (!file.path || !file.id) {
      throw new Error('File is not loaded correctly');
    }

    const start = performance.now();
    this.log.debug(`Starting ${taskHandler.meta.type} on "${file.path}"...`);

    let jobState = file.tasks.getItems().find((task) => task.type === taskHandler.meta.type);
    if (!jobState) {
      jobState = this.jobStateRepo.create(
        {
          file: file,
          type: taskHandler.meta.type,
          retries: 0,
          executedAt: new Date(),
        },
        { persist: false },
      );
    } else {
      jobState.retries++;
    }

    try {
      const parentResult = 'children' in taskHandler ? null : parentOutput;
      const result = await taskHandler.method(file, parentResult);
      if (('children' in taskHandler && taskHandler.children[0]) || taskHandler.meta.lockTask) {
        // we only have to store the result for tasks with children that depend on the output.
        const keepResult = 'children' in taskHandler && !!taskHandler.children[0];

        jobState.result = keepResult ? result : null;
        jobState.state = JobState.Completed;
        jobState.executedAt = new Date();

        // todo: if there are >100 task results for a parent task type, pause and wait for the
        // children to catch up before doing more.
        await this.em.persistAndFlush(jobState);
      }

      if ('targetConcurrency' in taskHandler.meta) {
        // the concurrency will be lowered at startup or after errors for some tasks,
        // so we make sure to reset it after successful runs.
        taskHandler.queue.concurrency = taskHandler.meta.targetConcurrency;
      }

      const duration = performance.now() - start;
      if (duration > 5000) {
        const humanDuration = ms(duration);
        this.log.warn(
          `Task ${taskHandler.meta.type} on "${file.path}" took ${humanDuration} to complete.`,
        );
      }
    } catch (error: any) {
      jobState.state = JobState.Failed;

      const isUnavailable = isUnavailableFileError(error);
      const isNetwork = isNetworkError(error);
      const isCorrupt = isCorruptFileError(error);
      if (isUnavailable) {
        // if the file exists on disk, its probably a task related error (eg, unsupported file type)
        // so we mark this job as failed. if it does not exist, we mark as unavailable.
        const exists = await stat(file.path).catch(() => false);
        if (!exists) {
          // todo: check if the source is unavailable entirely (ideally, detect the mount path and check that,
          // but crawling up the path until we find a mount point that is mounted might not be awful) and if so,
          // mark all files in that source as unavailable until it comes back. plex does something similar to gracefully handle
          // unavailable network mounts or drives that are unplugged, etc.
          file.info.unavailable = true;
          await this.em.persistAndFlush(file);
          return;
        }

        // the job failed, so we just store that so it won't run again.
        jobState.errorMessage = error.message;
        await this.em.persistAndFlush(jobState);
        return;
      } else if (isCorrupt) {
        file.info.corrupted = true;
        jobState.errorMessage = `CORRUPT_FILE_ERROR: ${error.message}`;
        await this.em.persistAndFlush([jobState, file]);
        return;
      } else if (isNetwork) {
        // network errors are annoying, we have to pause the entire queue and wait a bit before we retry.
        const sleepFor = randomInt(ms('1m'), ms('5m'));

        jobState.errorMessage = `NETWORK_ERROR: ${error.message}`;
        jobState.retryAfter = Date.now() + sleepFor;
        await this.em.persistAndFlush([jobState, file]);

        if (taskHandler.queue.isPaused) return;

        taskHandler.queue.pause();
        taskHandler.queue.concurrency = 1;

        const sleepForHuman = ms(sleepFor);
        this.log.warn(
          `Task ${taskHandler.meta.type} on "${file.path}" errored with a network error, sleeping for ${sleepForHuman} then retrying...`,
        );

        setTimeout(() => {
          taskHandler.queue.start();
        }, sleepFor).unref();
        return;
      }

      throw error;
    } finally {
      taskHandler.queuedFileIds.delete(file.id);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, { name: 'Cleanup old task data' })
  @UseRequestContext()
  protected async cleanupTasks() {
    // find all task entities that have no children wanting to run and delete them
    const tasksWithChildren = this.taskHandlers.filter((task) => task.children[0]);
    if (tasksWithChildren.size === 0) return;
    const filter = {
      $or: tasksWithChildren.map((task) => ({
        type: task.meta.type,
        state: JobState.Completed,
        $not: {
          file: {
            $or: task.children.map((child) => child.meta.filter),
          },
        },
      })),
    };

    console.dir(filter, { depth: null });
    const tasks = await this.jobStateRepo.find(filter);
    console.log({ tasks });
  }
}
