import { Entity, ManyToOne, PrimaryKey, Property, type Ref } from '@mikro-orm/core';
import { Field, ID } from '@nestjs/graphql';
import { MediaEntity } from './media.entity.js';

@Entity()
export class MediaPerceptualHashEntity {
  @PrimaryKey({ autoincrement: true })
  @Field(() => ID)
  id: number;

  @ManyToOne(() => MediaEntity, { ref: true })
  media: Ref<MediaEntity>;

  @Property({ type: 'blob' })
  hash: Buffer;

  @Property()
  from_ms: number;

  @Property()
  to_ms: number;
}
