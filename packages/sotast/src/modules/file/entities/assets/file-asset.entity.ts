import { Entity, OneToOne, OptionalProps, Property, type Ref } from "@mikro-orm/better-sqlite";
import { Field, ObjectType } from "@nestjs/graphql";
import { FileEntity } from "../file.entity.js";

@Entity({ abstract: true })
@ObjectType({ isAbstract: true })
export abstract class FileAssetEntity {
  @OneToOne(() => FileEntity, { primary: true, ref: true })
  file: Ref<FileEntity>;

  @Property()
  @Field()
  mimeType: string;

  @Property()
  @Field()
  width: number;

  @Property()
  @Field()
  height: number;

  [OptionalProps]: "path";
}
