import { Entity, ManyToOne, Property, type Ref } from '@mikro-orm/core';
import { Media } from './media.entity.js';

@Entity()
export class MediaVector {
  @ManyToOne(() => Media, { primary: true, ref: true })
  media: Ref<Media>;

  @Property({ type: 'blob' })
  data: Buffer;
}
