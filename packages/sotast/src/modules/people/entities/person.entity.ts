import { ArrayType, Collection, Entity, OneToMany, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Connection } from "nest-graphql-utils";
import { AutoPopulate } from "../../../helpers/autoloader.js";
import { FaceEntity } from "./face.entity.js";

@Entity({ tableName: "people" })
@ObjectType("Person")
export class PersonEntity {
  @PrimaryKey({ autoincrement: true })
  @Field(() => ID)
  id: number;

  @Property({ unique: true })
  @Field()
  name: string;

  @Property({ type: ArrayType })
  @Field(() => [String])
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

  @AutoPopulate()
  @OneToMany(
    () => FaceEntity,
    (face) => face.person,
  )
  faces = new Collection<FaceEntity>(this);

  // @AutoPopulate()
  // @OneToOne(() => TagEntity, { ref: true, nullable: true })
  // @Field(() => TagEntity, { nullable: true })
  // tag?: Ref<TagEntity>;

  [OptionalProps]: "aliases";
}

@ObjectType()
export class PersonConnection extends Connection(PersonEntity, {
  edgeName: "PersonEdge",
}) {}
