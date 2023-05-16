import { Entity, Enum, ManyToOne, Property, type Ref } from '@mikro-orm/core';
import { File } from '../file/entities/file.entity.js';
import { TaskType } from './task.enum.js';

// Tasks that have not started will not have task entities associated with them.
export enum TaskState {
  Failed,
  Completed,
}

@Entity()
export class Task {
  @ManyToOne(() => File, { primary: true })
  file: Ref<File>;

  @Enum({ items: () => TaskType, primary: true, columnType: 'int' })
  type: TaskType;

  @Enum(() => TaskState)
  state: TaskState;

  @Property({ type: 'jsonb', nullable: true })
  result?: unknown;
}
