import {
  ArrayType,
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  OptionalProps,
  PrimaryKey,
  Property,
  type Ref,
} from '@mikro-orm/core';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { TagEntity } from '../../file/entities/tag.entity.js';
import { FaceEntity } from '../../people/entities/face.entity.js';

/**
 * This entity represents people.
 * That includes, but is not limited to:
 * - Family members
 * - Friends
 * - Artists
 * - Actors
 * - Directors
 * - Writers
 * - Producers
 * - Musicians
 */
@Entity()
@ObjectType('Person')
export class PersonEntity {
  @PrimaryKey({ autoincrement: true })
  @Field(() => ID)
  id: number;

  @Property()
  @Field()
  name: string;

  @Property({ type: ArrayType })
  @Field(() => String)
  aliases: string[] = [];

  @Property({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  birthDate?: Date;

  @Property({ nullable: true })
  @Field({ nullable: true })
  deathDate?: Date;

  @OneToMany(() => FaceEntity, (face) => face.person)
  faces = new Collection<FaceEntity>(this);

  @OneToOne(() => TagEntity, { ref: true })
  @Field(() => TagEntity)
  tag: Ref<TagEntity>;

  [OptionalProps]: 'aliases';
}
