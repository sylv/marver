import type { ObjectQuery } from '@mikro-orm/better-sqlite';
import { SetMetadata } from '@nestjs/common';
import { recursive as mergeRecursive } from 'merge';
import { type FileEntity } from '../file/entities/file.entity.js';

export const QUEUE_KEY = Symbol('queue');
export type QueueKeyValue = QueueOptions;

export interface QueueOptions {
  type: string;
  parentType?: string;
  targetConcurrency: number;
  /**
   * Whether this queue contacts external services.
   * This has some minor effects, like starting with concurrency forced to 1 until the job succeeds to ensure the API is ready.
   */
  thirdPartyDependant: boolean;
  /** The filter that determines which files this task will run on. */
  fileFilter?: ObjectQuery<FileEntity>;
  /** The relations of the file to populate */
  populate?: string[];
  /**
   * If the task result is being stored (for parent tasks, mostly) and this is set, it will be called
   * once the task data is complete (usually once child tasks are finished processing it).
   * It can be used to clean up data on disk.
   */
  cleanupMethod?: (result: any) => Promise<void>;
}

export const Queue = (type: string, options: Omit<QueueOptions, 'type'>) => {
  mergeRecursive(options.fileFilter, { unavailable: false });
  return SetMetadata<symbol, QueueOptions>(QUEUE_KEY, {
    ...options,
    type: type,
  });
};
