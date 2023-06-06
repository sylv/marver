import { Embedded, Entity, ManyToOne, PrimaryKey, Property, type Ref } from '@mikro-orm/core';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ulid } from 'ulid';
import { Media } from '../../media/entities/media.entity.js';
import { BoundingBox } from './bounding-box.embeddable.js';
import { Person } from './person.entity.js';

@Entity()
@ObjectType()
export class Face {
  @PrimaryKey()
  @Field(() => ID)
  id: string = ulid();

  @Property({ type: 'blob' })
  vector: Buffer;

  @Embedded(() => BoundingBox)
  @Field(() => BoundingBox)
  boundingBox: BoundingBox;

  @ManyToOne(() => Media, { ref: true })
  media: Ref<Media>;

  @ManyToOne(() => Person, { ref: true, nullable: true })
  @Field(() => Person, { nullable: true })
  person?: Ref<Person>;
}
