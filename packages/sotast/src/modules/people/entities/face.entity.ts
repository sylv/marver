import {
  Embedded,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  type Ref,
} from '@mikro-orm/better-sqlite';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BoundingBoxEmbeddable } from './bounding-box.embeddable.js';
import { FileEntity } from '../../file/entities/file.entity.js';
import { PersonEntity } from './person.entity.js';

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

  @ManyToOne(() => FileEntity, { ref: true })
  file: Ref<FileEntity>;

  @ManyToOne(() => PersonEntity, { ref: true, nullable: true })
  @Field(() => PersonEntity, { nullable: true })
  person?: Ref<PersonEntity>;
}
