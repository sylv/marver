import type { FilterQuery } from '@mikro-orm/core';
import { SetMetadata } from '@nestjs/common';
import { recursive as mergeRecursive } from 'merge';
import { type FileEntity } from '../file/entities/file.entity.js';
import { type TaskType } from './task.enum.js';

export const TASKS_KEY = Symbol('tasks');
export type TasksKey = TaskOptions;

export interface TaskOptions {
  type: TaskType;
  concurrency: number;
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

export const Task = (
  type: TaskType,
  options: Omit<TaskOptions, 'type' | 'isParent' | 'cleanupMethod'>,
) => {
  mergeRecursive(options.fileFilter, { info: { unavailable: false } });
  return SetMetadata<symbol, TaskOptions>(TASKS_KEY, {
    ...options,
    type: type,
    isParent: false,
  });
};

export const TaskParent = (type: TaskType, options: Omit<TaskOptions, 'type' | 'isParent'>) => {
  mergeRecursive(options.fileFilter, { info: { unavailable: false } });
  return SetMetadata<symbol, TaskOptions>(TASKS_KEY, {
    ...options,
    type: type,
    isParent: true,
  });
};
