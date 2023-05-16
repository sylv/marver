import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import PQueue from 'p-queue';
import { File } from '../file/entities/file.entity.js';
import { Media } from '../media/entities/media.entity.js';
import { TaskOptions } from './task.decorator.js';

export interface LoadedTask extends TaskOptions<File | Media> {
  method: (file: File) => Promise<boolean>;
  queue: PQueue;
  queued: Set<string>;
}

@Injectable()
export class TaskService implements OnApplicationBootstrap {
  // private readonly taskHandlers = new Map<TaskType, LoadedTask>();
  // private readonly log = new Logger(TaskService.name);
  // constructor(private discoveryService: DiscoveryService, private orm: MikroORM) {}

  async onApplicationBootstrap() {
    // const methods = await this.discoveryService.providerMethodsWithMetaAtKey<TaskOptions>(TASKS_KEY);
    // for (const method of methods) {
    //   const withMethod: LoadedTask = {
    //     ...method.meta,
    //     method: method.discoveredMethod.handler.bind(method.discoveredMethod.parentClass.instance),
    //     queue: new PQueue({ concurrency: method.meta.concurrency }),
    //     queued: new Set(),
    //   };
    //   this.taskHandlers.set(withMethod.type, withMethod);
    //   this.scanForTasks(withMethod);
    // }
  }

  // private async scanForTasks(taskHandler: LoadedTask) {
  //   // todo: clump tasks for the same file into the same time frame to avoid sporadic file reads
  //   // that will result in things like rclone caching to be more effective on slow network mounts,
  //   // because we'd read the same file 5 times in a row instead of over the course of a day.
  //   const fetchCount = taskHandler.concurrency * 4;
  //   await taskHandler.queue.onSizeLessThan(fetchCount / 2);

  //   let hasMore = null;
  //   await RequestContext.createAsync(this.orm.em.fork(), async () => {
  //     const query = {
  //       $and: [
  //         taskHandler.filter,
  //         {
  //           id: {
  //             $nin: [...taskHandler.queued],
  //           },
  //         },
  //       ],
  //     };

  //     if (taskHandler.notIf) {
  //       for (const notIf of taskHandler.notIf) {
  //         const otherTask = this.taskHandlers.get(notIf);
  //         if (!otherTask) throw new Error(`Task "${notIf}" was not registered or does not exist.`);
  //         query.$and.push({
  //           $not: otherTask.filter,
  //         });
  //       }
  //     }

  //     // console.dir(query, { depth: null });
  //     const [files, filesTotal] = await this.fileRepo.findAndCount(query, {
  //       limit: fetchCount,
  //       orderBy: { lastCheckedAt: 'asc' },
  //       populate: taskHandler.populate as any,
  //     });

  //     for (const file of files) {
  //       taskHandler.queued.add(file.id);
  //       taskHandler.queue.add(async () => {
  //         try {
  //           // the task itself gets its own context, because otherwise for example
  //           // the task may create a partial entity then throw before persisting it,
  //           // and we'll update the file to mark it as corrupted, and accidentally persist
  //           // the partial entity.
  //           const start = performance.now();
  //           this.log.debug(`Starting ${taskHandler.type} on ${file.id} (${file.path})...`);
  //           await taskHandler.method(file);
  //           const duration = performance.now() - start;
  //           if (duration > 5000) {
  //             this.log.warn(`Task ${taskHandler.type} on ${file.id} (${file.path}) took ${ms(duration)} to complete.`);
  //           }
  //         } catch (error: any) {
  //           const isCorrupted = error instanceof CorruptedFileError;
  //           const isMissing =
  //             ((error.code === 'ENOENT' || error.message.includes('No such file')) &&
  //               // make sure the error is for our file and not eg some missing metadata
  //               (error.path === file.path || error.message.includes(file.path))) ||
  //             error.message === 'Invalid image format' ||
  //             // todo: this one should be handled per task type because its based on
  //             // support by external libraries, the file isnt actually corrupt.
  //             error.message === 'Unsupported image type';

  //           if (isMissing || isCorrupted) {
  //             // todo: having a file.createReadStream() method that automatically handles this
  //             // might make a lot of sense, or else handling this everywhere is going to be a nightmare.
  //             if (isCorrupted) this.log.warn(`File ${file.id} (${file.path}) is corrupted, marking as such.`);
  //             else this.log.warn(`File ${file.id} (${file.path}) no longer exists, marking as unavailable.`);
  //             file.unavailable = true;
  //             if (isCorrupted) file.corrupted = true;
  //             await this.fileRepo.persistAndFlush(file);
  //             return;
  //           }

  //           throw error;
  //         } finally {
  //           taskHandler.queued.delete(file.id);
  //         }
  //       });
  //     }

  //     hasMore = filesTotal > files.length;
  //   });

  //   if (!hasMore) {
  //     const sleepFor = randomInt(15000, 30000);
  //     this.log.debug(`No more files to process for task ${taskHandler.type}, sleeping for ${ms(sleepFor)}...`);
  //     await sleep(sleepFor);
  //   }

  //   this.scanForTasks(taskHandler);
  // }
}
