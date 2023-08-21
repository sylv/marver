import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  type Ref,
} from '@mikro-orm/core';
import { FileTag } from './file-tag.entity.js';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Person } from '../../people/entities/person.entity.js';

@Entity()
@ObjectType()
export class Tag {
  @PrimaryKey()
  @Field(() => ID)
  name: string;

  @Property()
  aliases: string[] = [];

  @Property()
  description?: string;

  @Property({ nullable: true })
  color?: number;

  @ManyToOne(() => Tag, { nullable: true, ref: true })
  parent?: Ref<Tag>;

  @OneToMany(() => Tag, (tag) => tag.parent)
  children = new Collection<Tag>(this);

  @OneToOne(() => Person, (person) => person.tag, { nullable: true, ref: true })
  person?: Ref<Person>;

  @OneToMany(() => FileTag, (file) => file.tag)
  files = new Collection<FileTag>(this);
}

export enum TagColorPresets {
  Red = 0xe74c3c,
  Orange = 0xe67e22,
  Yellow = 0xf1c40f,
  Green = 0x2ecc71,
  Blue = 0x3498db,
  Purple = 0x9b59b6,
  Pink = 0xe91e63,
}
