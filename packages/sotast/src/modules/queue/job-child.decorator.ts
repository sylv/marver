import { type EntityField, type FilterQuery } from '@mikro-orm/core';
import { SetMetadata } from '@nestjs/common';
import { type FileEntity } from '../file/entities/file.entity.js';

export const QUEUE_CHILD_KEY = Symbol('task-child');
export type QueueChildKeyValue = QueueChildOptions;

export interface QueueChildOptions {
  parentType: string;
  type: string;
  concurrency: number;
  filter: FilterQuery<FileEntity>;
  populate?: EntityField<FileEntity>[];
  lockTask?: boolean;
}

export const ChildJob = (type: string, options: Omit<QueueChildOptions, 'type'>) => {
  return SetMetadata<symbol, QueueChildOptions>(QUEUE_CHILD_KEY, {
    ...options,
    type: type,
  });
};
