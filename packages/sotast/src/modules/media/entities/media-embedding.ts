import { Entity, ManyToOne, Property, type Ref } from '@mikro-orm/core';
import { MediaEntity } from './media.entity.js';

@Entity()
export class MediaEmbeddingEntity {
  @ManyToOne(() => MediaEntity, { primary: true, ref: true })
  media: Ref<MediaEntity>;

  @Property({ type: 'blob' })
  data: Buffer;
}
