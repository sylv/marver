import type { FilterQuery } from '@mikro-orm/core';
import { SetMetadata } from '@nestjs/common';
import { recursive } from 'merge';
import { File } from '../file/entities/file.entity.js';
import { TaskType } from './task.enum.js';

export const TASKS_KEY = Symbol('tasks');
export type TasksKey = TaskOptions;

export interface TaskOptions {
  type: TaskType;
  concurrency: number;
  filter: FilterQuery<File>;
  populate?: string[];
  isParent?: boolean;
  cleanupMethod?: (result: any) => Promise<void>;
}

export const Task = (type: TaskType, options: Omit<TaskOptions, 'type' | 'isParent'>) => {
  recursive(options.filter, { metadata: { unavailable: false } });
  return SetMetadata<symbol, TaskOptions>(TASKS_KEY, {
    ...options,
    type: type,
    isParent: false,
  });
};

export const TaskParent = (type: TaskType, options: Omit<TaskOptions, 'type' | 'isParent'>) => {
  recursive(options.filter, { metadata: { unavailable: false } });
  return SetMetadata<symbol, TaskOptions>(TASKS_KEY, {
    ...options,
    type: type,
    isParent: true,
  });
};
