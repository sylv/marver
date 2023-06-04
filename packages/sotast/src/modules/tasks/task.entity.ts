import { Entity, Enum, ManyToOne, PrimaryKeyProp, Property, type Ref } from '@mikro-orm/core';
import { TaskType } from './task.enum.js';
import { File } from '../file/entities/file.entity.js';

// Tasks that have not started will not have task entities associated with them.
export enum TaskState {
  Failed,
  Completed,
}

@Entity()
export class Task {
  @ManyToOne(() => File, { primary: true, ref: true })
  file: Ref<File>;

  @Enum({ items: () => TaskType, primary: true, type: 'int' })
  type: TaskType;

  @Enum(() => TaskState)
  state: TaskState;

  @Property({ type: 'jsonb', nullable: true })
  result?: unknown;

  [PrimaryKeyProp]: 'entityId';
}
