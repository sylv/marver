import { DiscoveryService } from "@golevelup/nestjs-discovery";
import { EntityManager, EntityRepository, RequestContext, type ObjectQuery } from "@mikro-orm/libsql";
import { MikroORM } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, Logger, type OnApplicationBootstrap } from "@nestjs/common";
import { randomInt } from "crypto";
import ms from "ms";
import PQueue from "p-queue";
import { setTimeout as sleep } from "timers/promises";
import { config } from "../../config.js";
import { FileEntity } from "../file/entities/file.entity.js";
import { State, JobStateEntity } from "./job-state.entity.js";
import { QUEUE_KEY, type QueueKeyValue, type QueueOptions } from "./queue.decorator.js";
import { Collection } from "@discordjs/collection";

// todo: cleanupMethod is never used
interface LoadedQueue {
  method: (entity: FileEntity | FileEntity[], parentOutput?: unknown) => Promise<unknown>;
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
    const methods = await this.discoveryService.providerMethodsWithMetaAtKey<QueueKeyValue>(QUEUE_KEY);

    // sort by parents first
    methods.sort((a, b) => {
      if (a.meta.parentType && !b.meta.parentType) return 1;
      if (!a.meta.parentType && b.meta.parentType) return -1;
      return 0;
    });

    for (const method of methods) {
      const concurrency = method.meta.targetConcurrency;
      const withMethod: LoadedQueue = {
        method: method.discoveredMethod.handler.bind(method.discoveredMethod.parentClass.instance),
        limiter: new PQueue({ concurrency: concurrency }),
        pendingFileIds: new Set(),
        meta: method.meta,
      };

      if (method.meta.parentType) {
        const parent = this.queues.get(method.meta.parentType);
        if (!parent) {
          throw new Error(`Parent queue "${method.meta.parentType}" not found for "${method.meta.type}"`);
        }

        if (parent.meta.batchSize) {
          throw new Error(`Parent queue "${method.meta.parentType}" cannot have a batch size`);
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
    const fetchCount = queue.meta.batchSize ?? queue.meta.targetConcurrency * 4;
    if (queue.meta.batchSize) {
      await queue.limiter.onEmpty();
    } else {
      await queue.limiter.onSizeLessThan(fetchCount / 2);
    }

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
                .select("file_id")
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

      // todo: if there are >100 job results for a parent queue type, pause and wait for the
      // children to catch up before doing more.

      // todo: we should only run the parent if the children want to run on that file.
      if (queue.parent) {
        // only run if the parent has run successfully
        query.$and!.push({
          id: {
            $in: this.jobStateRepo
              .createQueryBuilder()
              .select("file_id")
              .where({
                type: queue.parent.meta.type,
                state: State.Completed,
              })
              .getKnexQuery() as any,
          },
        });
      }

      const [files, filesTotal] = await this.fileRepo.findAndCount(query, {
        limit: fetchCount,
        populate: ["jobStates", ...((queue.meta.populate ?? []) as any[])],
        orderBy: {
          // newer bump date = higher priority
          bumpedAt: "DESC",
          // older indexed date = higher priority
          indexedAt: "ASC",
        },
        populateWhere: {
          // only load the job state for this queue type and the parent (so we can get the job data)
          jobStates: {
            type: {
              $in: queue.parent ? [queue.meta.type, queue.parent.meta.type] : [queue.meta.type],
            },
          },
        },
      });

      if (files[0] && queue.meta.batchSize) {
        for (const file of files) {
          queue.pendingFileIds.add(file.id);
        }

        void queue.limiter.add(() => this.runJob(queue, files));
      } else {
        for (const file of files) {
          queue.pendingFileIds.add(file.id);
          if (queue.parent) {
            const parentJobState = file.jobStates.getItems().find((jobState) => {
              return jobState.type === queue.parent!.meta.type;
            });

            if (!parentJobState) {
              throw new Error(`Parent queue "${queue.parent.meta.type}" not found for "${queue.meta.type}"`);
            }

            if (!parentJobState.result) {
              throw new Error(
                `Parent queue "${queue.parent.meta.type}" has no result for "${queue.meta.type}"`,
              );
            }

            void queue.limiter.add(() => this.runJob(queue, [file], parentJobState.result));
          } else {
            void queue.limiter.add(() => this.runJob(queue, [file]));
          }
        }
      }

      hasMore = filesTotal > files.length;
    });

    if (!hasMore) {
      const sleepFor = randomInt(15000, 30000);
      await sleep(sleepFor);
    }

    process.nextTick(() => {
      void this.scanQueue(queue);
    });
  }

  private async runJob(queueHandler: LoadedQueue, files: FileEntity[], parentOutput?: unknown) {
    const firstFile = files[0];
    if (!firstFile) throw new Error("No files to process");
    if (!firstFile.path || !firstFile.id) {
      throw new Error("File is not loaded correctly");
    }

    const start = performance.now();
    if (files.length === 1) {
      this.log.debug(`Starting ${queueHandler.meta.type} on "${firstFile.path}"...`);
    } else {
      this.log.debug(`Starting ${queueHandler.meta.type} on ${files.length} files...`);
    }

    try {
      const isBatchHandler = !!queueHandler.meta.batchSize;
      const input = isBatchHandler ? files : firstFile;
      const result = await queueHandler.method(input, parentOutput);
      const keepResult = !!queueHandler.children; // only parent queues need to store their result for children to consume

      for (const file of files) {
        const jobState = this.getJobState(file, queueHandler.meta.type);
        jobState.result = keepResult ? result : null;
        jobState.state = State.Completed;
        jobState.executedAt = new Date();
        this.em.persist(jobState);
      }

      // the concurrency can be lowered during errors, or at startup as a warm-up period.
      // we want to make sure a successful job will restore the concurrency to the target.
      queueHandler.limiter.concurrency = queueHandler.meta.targetConcurrency;

      // help diagnose slow jobs
      const duration = performance.now() - start;
      if (duration > 5000) {
        if (files.length === 1) {
          const humanDuration = ms(duration);
          this.log.warn(
            `Job ${queueHandler.meta.type} on "${firstFile.path}" took ${humanDuration} to complete.`,
          );
        } else {
          this.log.warn(
            `Job ${queueHandler.meta.type} on ${files.length} files took ${ms(duration)} to complete.`,
          );
        }
      }
    } catch (error: any) {
      this.log.error(error, error.stack);
      for (const file of files) {
        const jobState = this.getJobState(file, queueHandler.meta.type);
        jobState.state = State.Failed;
        jobState.errorMessage = error.message;
        this.em.persist(jobState);
      }
    } finally {
      await this.em.flush();
      for (const file of files) {
        queueHandler.pendingFileIds.delete(file.id);
      }
    }
  }

  private getJobState(file: FileEntity, type: string) {
    const jobState = file.jobStates.getItems().find((jobState) => jobState.type === type);
    if (!jobState) {
      return this.jobStateRepo.create({
        file: file,
        type: type,
        retries: 0,
        state: State.Completed,
        executedAt: new Date(),
      });
    }

    return jobState;
  }
}
