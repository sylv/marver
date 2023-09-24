import { Collection } from '@discordjs/collection';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { EntityManager, EntityRepository } from '@mikro-orm/sqlite';
import { MikroORM, RequestContext, UseRequestContext, type FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomInt } from 'crypto';
import ms from 'ms';
import PQueue from 'p-queue';
import { setTimeout as sleep } from 'timers/promises';
import { config } from '../../config.js';
import { CorruptedFileError } from '../../errors/corrupted-file-error.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { type TaskChildOptions } from './task-child.decorator.js';
import { TASKS_KEY, type TaskOptions, type TasksKey } from './task.decorator.js';
import { TaskEntity, TaskState } from './task.entity.js';
import { TaskType } from './task.enum.js';
import { setTimeout } from 'timers';

// todo: cleanupMethod is never used
export interface LoadedTask {
  method: (entity: FileEntity) => Promise<unknown>;
  meta: TaskOptions;
  children: LoadedChildTask[];
  queue: PQueue;
  queued: Set<string>;
}

export interface LoadedChildTask {
  method: (entity: FileEntity, parentResult: unknown) => Promise<void>;
  meta: TaskChildOptions;
  queue: PQueue;
  queued: Set<string>;
}

@Injectable()
export class TaskService implements OnApplicationBootstrap {
  @InjectRepository(TaskEntity) private taskRepo: EntityRepository<TaskEntity>;
  @InjectRepository(FileEntity) private fileRepo: EntityRepository<FileEntity>;

  private readonly taskHandlers = new Collection<TaskType, LoadedTask>();
  private readonly log = new Logger(TaskService.name);
  constructor(
    private discoveryService: DiscoveryService,
    private orm: MikroORM,
    private em: EntityManager,
  ) {}

  async onApplicationBootstrap() {
    if (config.disable_tasks) return;
    const methods = await this.discoveryService.providerMethodsWithMetaAtKey<TasksKey>(TASKS_KEY);
    for (const method of methods) {
      const withMethod: LoadedTask = {
        method: method.discoveredMethod.handler.bind(method.discoveredMethod.parentClass.instance),
        queue: new PQueue({ concurrency: method.meta.concurrency }),
        queued: new Set(),
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

  private async scanForParentTasks(taskHandler: LoadedTask) {
    // todo: clump tasks for the same file into the same time frame to avoid sporadic file reads
    // that will result in things like rclone caching to be more effective on slow network mounts,
    // because we'd read the same file 5 times in a row instead of over the course of a day.
    // it might even make sense to have a config option that operates on a single file at a time, waiting until
    // all tasks for that file are complete before moving to the next one. that could help in a lot of situations
    const fetchCount = taskHandler.meta.concurrency * 4;
    await taskHandler.queue.onSizeLessThan(fetchCount / 2);

    // todo: hash the @TaskHandler function and when it changes,
    // retry failed tasks for that handler, even if they are over
    // the retry count.

    // todo: let @TaskHandlers have a "revision" property that is
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
              $nin: [...taskHandler.queued],
            },
          },
          {
            // don't run a task if it has already run for that file
            // (for parent tasks, or for tasks with lockTask enabled)
            id: {
              // types are wrong, this totally works.
              // (until an update breaks it silently)
              $nin: this.taskRepo
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
        populate: taskHandler.meta.populate as any,
      });

      for (const file of files) {
        taskHandler.queued.add(file.id);
        void taskHandler.queue.add(() => this.runTask(taskHandler, file));
      }

      hasMore = filesTotal > files.length;
    });

    if (!hasMore) {
      const sleepFor = randomInt(15000, 30000);
      this.log.debug(
        `No more files to process for task ${TaskType[taskHandler.meta.type]}, sleeping for ${ms(
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
    taskHandler: LoadedTask | LoadedChildTask,
    file: FileEntity,
    parentOutput?: unknown,
  ) {
    const startedAt = new Date();
    const start = performance.now();
    this.log.debug(`Starting ${TaskType[taskHandler.meta.type]} on "${file.path}"...`);

    if (!file.path || !file.id) {
      throw new Error('File is not loaded correctly');
    }

    try {
      if ('children' in taskHandler) {
        // handle running parent tasks, even though they may not have children
        const result = await taskHandler.method(file);
        const endedAt = new Date();
        if (taskHandler.children[0] || taskHandler.meta.lockTask) {
          const keepResult = !!taskHandler.children[0];
          // if the task has children, we have to say we completed the task so they can run,
          // especially if they have to access the return data.
          const task = this.taskRepo.create({
            file: file,
            type: taskHandler.meta.type,
            state: TaskState.Completed,
            result: keepResult ? result : null,
            startedAt: startedAt,
            endedAt: endedAt,
            retries: 0,
          });

          // todo: if there are >100 task results for a task type, pause and wait for the
          // children to catch up before doing more.
          await this.em.persistAndFlush(task);
        }
      } else {
        // handle running child tasks
        if (!parentOutput) throw new Error('Parent output is required for child tasks');
        await taskHandler.method(file, parentOutput);
      }

      const duration = performance.now() - start;
      if (duration > 5000) {
        this.log.warn(
          `Task ${TaskType[taskHandler.meta.type]} on "${file.path}" took ${ms(
            duration,
          )} to complete.`,
        );
      }
    } catch (error: any) {
      const isCorrupted = error instanceof CorruptedFileError;
      const isMissing =
        ((error.code === 'ENOENT' || error.message.includes('No such file')) &&
          // make sure the error is for our file and not eg some missing metadata
          (error.path === file.path || error.message.includes(file.path))) ||
        error.message === 'Invalid image format' ||
        // todo: this one should be handled per task type because its based on
        // support by external libraries, the file isnt actually corrupt.
        error.message === 'Unsupported image type' ||
        error.message === 'Exception calling application: unable to read file.' ||
        error.message === 'Exception calling application: Image not found';

      if (isMissing || isCorrupted) {
        // todo: this assumes entityId is the file id, which may not be true in the future.
        // todo: having a file.createReadStream() method that automatically handles this
        // might make a lot of sense, or else handling this everywhere is going to be a nightmare.
        if (isCorrupted)
          this.log.warn(`File ${file.id} (${file.path}) is corrupted, marking as such.`);
        else
          this.log.warn(
            `File ${error.fileId} (${error.path}) no longer exists, marking as unavailable.`,
          );

        file.info.unavailable = true;
        if (isCorrupted) file.info.corrupted = true;
        await this.em.persistAndFlush(file);

        return;
      }

      const endedAt = new Date();
      const task = this.taskRepo.create({
        file: file,
        type: taskHandler.meta.type,
        state: TaskState.Failed,
        errorMessage: error.message,
        result: null,
        startedAt: startedAt,
        endedAt: endedAt,
        retries: 0,
      });

      await this.em.persistAndFlush(task);
      throw error;
    } finally {
      taskHandler.queued.delete(file.id);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  @UseRequestContext()
  protected async cleanupTasks() {
    // find all task entities that have no children wanting to run and delete them
    const tasksWithChildren = this.taskHandlers.filter((task) => task.children[0]);
    if (tasksWithChildren.size === 0) return;
    const filter = {
      $or: tasksWithChildren.map((task) => ({
        type: task.meta.type,
        state: TaskState.Completed,
        $not: {
          file: {
            $or: task.children.map((child) => child.meta.filter),
          },
        },
      })),
    };

    console.dir(filter, { depth: null });
    const tasks = await this.taskRepo.find(filter);
    console.log({ tasks });
  }
}
