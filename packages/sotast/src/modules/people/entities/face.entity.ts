import { Embedded, Entity, ManyToOne, PrimaryKey, Property, type Ref } from '@mikro-orm/core';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MediaEntity } from '../../media/entities/media.entity.js';
import { PersonEntity } from '../../metadata/entities/person.entity.js';
import { BoundingBoxEmbeddable } from './bounding-box.embeddable.js';

@Entity()
@ObjectType('Face')
export class FaceEntity {
  @PrimaryKey({ autoincrement: true })
  @Field(() => ID)
  id: number;

  @Property({ type: 'blob' })
  vector: Buffer;

  @Embedded(() => BoundingBoxEmbeddable)
  @Field(() => BoundingBoxEmbeddable)
  boundingBox: BoundingBoxEmbeddable;

  @ManyToOne(() => MediaEntity, { ref: true })
  media: Ref<MediaEntity>;

  @ManyToOne(() => PersonEntity, { ref: true, nullable: true })
  @Field(() => PersonEntity, { nullable: true })
  person?: Ref<PersonEntity>;
}
