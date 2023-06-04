import { EntityField, FilterQuery } from '@mikro-orm/core';
import { SetMetadata } from '@nestjs/common';
import { TaskType } from './task.enum.js';
import { File } from '../file/entities/file.entity.js';

export const TASK_CHILD_KEY = Symbol('task-child');
export type TaskChildKey = TaskChildOptions;

export interface TaskChildOptions {
  parentType: TaskType;
  type: TaskType;
  concurrency: number;
  filter: FilterQuery<File>;
  populate?: EntityField<File>[];
}

export const TaskChild = (type: TaskType, options: Omit<TaskChildOptions, 'type'>) => {
  return SetMetadata<symbol, TaskChildOptions>(TASK_CHILD_KEY, {
    ...options,
    type: type,
  });
};
