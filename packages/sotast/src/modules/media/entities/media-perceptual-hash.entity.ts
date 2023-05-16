import { Entity, ManyToOne, PrimaryKey, Property, type Ref } from '@mikro-orm/core';
import { Media } from './media.entity.js';

@Entity()
export class MediaPerceptualHash {
  @PrimaryKey({ autoincrement: true })
  id: number;

  @ManyToOne(() => Media, { ref: true })
  media: Ref<Media>;

  @Property({ type: 'blob' })
  hash: Buffer;

  @Property()
  from_ms: number;

  @Property()
  to_ms: number;
}
