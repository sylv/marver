import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  OptionalProps,
  PrimaryKey,
  PrimaryKeyProp,
  Property,
  type Ref,
} from '@mikro-orm/better-sqlite';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PersonEntity } from '../../people/entities/person.entity.js';
import { FileTagEntity } from './file-tag.entity.js';

@Entity({ tableName: 'tags' })
@ObjectType('Tag')
export class TagEntity {
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

  [PrimaryKeyProp]: 'name';
  [OptionalProps]: 'aliases';
}
