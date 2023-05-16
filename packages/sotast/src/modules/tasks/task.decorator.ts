import type { FilterQuery } from '@mikro-orm/core';
import { SetMetadata } from '@nestjs/common';
import { recursive as mergeRecursive } from 'merge';
import type { File } from '../file/entities/file.entity.js';
import { Media } from '../media/entities/media.entity.js';
import { TaskType } from './task.enum.js';

export const TASKS_KEY = Symbol('tasks');
export type TasksKey = TaskOptions<File | Media>;

export interface TaskOptions<T extends File | Media> {
  entity: typeof File | typeof Media;
  type: TaskType;
  filter: FilterQuery<T>;
  concurrency: number;
  /** Do not run this task if the file will also run for this other task. */
  notIf?: TaskType[];
  populate?: Extract<keyof T, string>[];
  parentType?: TaskType;
  isParent?: boolean;
  cleanupMethod?: (result: any) => Promise<void>;
}

export const Task = <T extends typeof File | typeof Media>(
  entity: T,
  type: TaskType,
  options: Omit<TaskOptions<InstanceType<T>>, 'type' | 'entity'>
) => {
  // if (options.parentType !== undefined) throw new Error('Use the TaskChild decorator instead');
  // if (options.isParent !== undefined) throw new Error('Use the TaskParent decorator instead');
  mergeRecursive(options.filter, { unavailable: false });
  return SetMetadata<symbol, TaskOptions<InstanceType<T>>>(TASKS_KEY, {
    entity: entity,
    type,
    ...options,
  });
};

export const TaskParent = <T extends typeof File | typeof Media>(
  entity: T,
  type: TaskType,
  options: Omit<TaskOptions<InstanceType<T>>, 'type' | 'isParent' | 'parentType' | 'entity'>
) => {
  return Task(entity, type, { ...options, isParent: true });
};

export const TaskChild = <T extends typeof File | typeof Media>(
  entity: T,
  type: TaskType,
  options: Omit<TaskOptions<InstanceType<T>>, 'type' | 'isParent' | 'parentType' | 'entity'> & { parentType: TaskType }
) => {
  return Task(entity, type, { ...options, parentType: options.parentType });
};
