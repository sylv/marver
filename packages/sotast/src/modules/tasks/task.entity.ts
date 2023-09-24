import { Entity, Enum, ManyToOne, PrimaryKeyProp, Property, type Ref } from '@mikro-orm/core';
import { TaskType } from './task.enum.js';
import { FileEntity } from '../file/entities/file.entity.js';

// Tasks that have not started will not have task entities associated with them.
export enum TaskState {
  Failed,
  Completed,
}

@Entity()
export class TaskEntity {
  @ManyToOne(() => FileEntity, { primary: true, ref: true })
  file: Ref<FileEntity>;

  @Enum({ items: () => TaskType, primary: true, type: 'int' })
  type: TaskType;

  @Enum(() => TaskState)
  state: TaskState;

  @Property({ type: 'jsonb', nullable: true })
  result?: unknown;

  @Property({ nullable: true })
  errorMessage?: string;

  @Property()
  retries: number;

  @Property()
  startedAt: Date;

  @Property()
  endedAt: Date;

  [PrimaryKeyProp]: 'entityId';
}
