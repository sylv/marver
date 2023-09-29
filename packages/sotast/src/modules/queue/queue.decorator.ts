import type { FilterQuery } from '@mikro-orm/core';
import { SetMetadata } from '@nestjs/common';
import { recursive as mergeRecursive } from 'merge';
import { type FileEntity } from '../file/entities/file.entity.js';

export const QUEUE_KEY = Symbol('queue');
export type QueueKeyValue = QueueOptions;

export interface QueueOptions {
  type: string;
  targetConcurrency: number;
  /**
   * Whether this queue contacts external services.
   * This has some minor effects, like starting with concurrency forced to 1 until the job succeeds to ensure the API is ready.
   */
  thirdPartyDependant: boolean;
  /** The filter that determines which files this task will run on. */
  fileFilter: FilterQuery<FileEntity>;
  /** The relations of the file to populate */
  populate?: string[];
  /**
   * Whether to store that the task was completed in the database.
   * If disabled, the task will run whenever the filter matches a file.
   * If enabled, the task will run on filter match, *if* the task has not run for that file before.
   */
  lockTask?: boolean;
  /**
   * For parent tasks, this method will be called once all child tasks have completed.
   * As an example, you have a parent task that writes a file to disk, and a child task that reads that file,
   * once the child task is done with the file, the parent task can use cleanupMethod to delete the file.
   */
  cleanupMethod?: (result: any) => Promise<void>;
  /** @internal */
  isParent?: boolean;
}

export const Queue = (
  type: string,
  options: Omit<QueueOptions, 'type' | 'isParent' | 'cleanupMethod'>,
) => {
  mergeRecursive(options.fileFilter, { info: { unavailable: false } });
  return SetMetadata<symbol, QueueOptions>(QUEUE_KEY, {
    ...options,
    type: type,
    isParent: false,
  });
};

export const ParentQueue = (type: string, options: Omit<QueueOptions, 'type' | 'isParent'>) => {
  mergeRecursive(options.fileFilter, { info: { unavailable: false } });
  return SetMetadata<symbol, QueueOptions>(QUEUE_KEY, {
    ...options,
    type: type,
    isParent: true,
  });
};
