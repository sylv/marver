import {
  BeforeCreate,
  BeforeUpdate,
  Entity,
  Enum,
  Index,
  ManyToOne,
  OptionalProps,
  Property,
  type Ref,
} from '@mikro-orm/better-sqlite';
import ms from 'ms';
import { FileEntity } from '../file/entities/file.entity.js';

// Tasks that have not started will not have task entities associated with them.
export enum JobState {
  Failed,
  Completed,
}

const RETRY_DELAYS = [
  ms('1m'),
  ms('5m'),
  ms('15m'),
  ms('30m'),
  ms('1h'),
  ms('4h'),
  ms('8h'),
  ms('16h'),
  ms('1d'),
  ms('5d'),
];

@Entity()
export class JobStateEntity {
  @ManyToOne(() => FileEntity, { primary: true, ref: true })
  file: Ref<FileEntity>;

  @Property({ primary: true, type: 'text' })
  @Index()
  type: string;

  @Enum(() => JobState)
  @Index()
  state: JobState;

  @Property({ type: 'jsonb', nullable: true })
  result?: unknown;

  @Property({ nullable: true })
  errorMessage?: string;

  @Property({ nullable: true })
  retryAfter?: number;

  @Property()
  retries: number;

  @Property()
  executedAt: Date;

  // some of these are actually required, but are marked optional so we can
  // create the entity without them set and add them later before persisting.
  [OptionalProps]: 'state';

  @BeforeCreate()
  @BeforeUpdate()
  computeRetryAfter() {
    if (this.retries == null || this.state == null) {
      throw new Error('"retries" and "state" must be present');
    }

    if (this.state === JobState.Completed) {
      this.retryAfter = undefined;
      return;
    }

    if (this.retryAfter && this.retryAfter > Date.now()) {
      // maybe a retry was already configured, and we don't want to overwrite that.
      return;
    }

    if (this.retries >= RETRY_DELAYS.length) {
      this.retryAfter = undefined;
      return;
    }

    this.retryAfter = Date.now() + RETRY_DELAYS[this.retries];
  }
}
