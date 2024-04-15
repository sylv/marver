import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OptionalProps,
  PrimaryKey,
  PrimaryKeyProp,
  Property,
  type Ref,
} from "@mikro-orm/better-sqlite";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { FileTagEntity } from "./file-tag.entity.js";

@Entity({ tableName: "tags" })
@ObjectType("Tag")
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

  @OneToMany(
    () => TagEntity,
    (tag) => tag.parent,
  )
  children = new Collection<TagEntity>(this);

  @OneToMany(
    () => FileTagEntity,
    (file) => file.tag,
  )
  files = new Collection<FileTagEntity>(this);

  // @OneToOne(() => PersonEntity, (person) => person.tag, { nullable: true, ref: true })
  // person?: Ref<PersonEntity>;

  [PrimaryKeyProp]: "name";
  [OptionalProps]: "aliases";
}
