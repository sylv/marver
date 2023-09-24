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
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { FileTagEntity } from './file-tag.entity.js';
import { PersonEntity } from '../../metadata/entities/person.entity.js';

@Entity()
@ObjectType('Tag')
export class TagEntity {
  constructor(name: string) {}

  @PrimaryKey()
  @Field(() => ID)
  name: string;

  @Property()
  aliases: string[] = [];

  @Property()
  description?: string;

  @Property({ nullable: true })
  color?: number;

  @ManyToOne(() => TagEntity, { nullable: true, ref: true })
  parent?: Ref<TagEntity>;

  @OneToMany(() => TagEntity, (tag) => tag.parent)
  children = new Collection<TagEntity>(this);

  @OneToOne(() => PersonEntity, (person) => person.tag, { nullable: true, ref: true })
  person?: Ref<PersonEntity>;

  @OneToMany(() => FileTagEntity, (file) => file.tag)
  files = new Collection<FileTagEntity>(this);
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
