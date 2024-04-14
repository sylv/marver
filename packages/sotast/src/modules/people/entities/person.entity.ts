import { ArrayType, Collection, Entity, OneToMany, OneToOne, OptionalProps, PrimaryKey, Property, type Ref } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { TagEntity } from "../../file/entities/tag.entity.js";
import { FaceEntity } from "./face.entity.js";

@Entity({ tableName: "people" })
@ObjectType("Person")
// todo: require that the tag is non-nullable when the person has a name
// that can't be done now because sqlite doesn't like constaints.
// @Check<PersonEntity>({
//   expression: (columns) => `${columns.name} IS NULL OR ${columns.tag} IS NOT NULL`,
// })
export class PersonEntity {
  @PrimaryKey({ autoincrement: true })
  @Field(() => ID)
  id: number;

  @Property({ nullable: true })
  @Field({ nullable: true })
  name?: string;

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

  @OneToMany(
    () => FaceEntity,
    (face) => face.person,
  )
  faces = new Collection<FaceEntity>(this);

  @OneToOne(() => TagEntity, { ref: true, nullable: true })
  @Field(() => TagEntity, { nullable: true })
  tag?: Ref<TagEntity>;

  [OptionalProps]: "aliases";
}
