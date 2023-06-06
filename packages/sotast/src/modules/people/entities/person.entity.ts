import { Collection, Entity, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ulid } from 'ulid';
import { Tag } from '../../file/entities/tag.entity.js';
import { Face } from './face.entity.js';

@Entity()
@ObjectType()
export class Person {
  @PrimaryKey()
  @Field(() => ID)
  id: string = ulid();

  @Property()
  @Field()
  name: string;

  @OneToMany(() => Face, (face) => face.person)
  faces = new Collection<Face>(this);

  @OneToOne(() => Tag)
  tag: Tag;
}
