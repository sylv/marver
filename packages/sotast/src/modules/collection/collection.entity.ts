import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { ulid } from "ulid";
import { FileEntity } from "../file/entities/file.entity";
import { AutoPopulate } from "../../helpers/autoloader";

@Entity({ tableName: "collections" })
@ObjectType("Collection")
export class CollectionEntity {
  @PrimaryKey()
  @Field(() => ID)
  id: string = ulid();

  @Field()
  @Property()
  name: string;

  @Property({ nullable: true })
  path?: string;

  @Property()
  generated: boolean;

  @Field({ nullable: true })
  @Property({ nullable: true })
  description?: string;

  @AutoPopulate()
  @Field(() => CollectionEntity, { nullable: true })
  @ManyToOne(() => CollectionEntity, { nullable: true })
  parent?: CollectionEntity;

  @AutoPopulate()
  @Field(() => [CollectionEntity])
  @OneToMany(
    () => CollectionEntity,
    (collection) => collection.parent,
  )
  children?: CollectionEntity[];

  @ManyToMany(
    () => FileEntity,
    (file) => file.collections,
    { owner: true },
  )
  files = new Collection<FileEntity>(this);
}
