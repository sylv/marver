import { Entity, Enum, ManyToOne, PrimaryKey, Property, type Ref } from "@mikro-orm/better-sqlite";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import mime from "mime-types";
import { join } from "path";
import { ulid } from "ulid";
import { config } from "../../../config.js";
import { FileEntity } from "./file.entity.js";

export enum FileAssetType {
  Poster = 0,
  Thumbnail = 1,
  Timeline = 2,
}

registerEnumType(FileAssetType, { name: "FileAssetType" });

@Entity({ tableName: "file_assets" })
@ObjectType("FileAsset")
export abstract class FileAssetEntity {
  @PrimaryKey()
  @Field(() => ID)
  id: string = ulid();

  @Enum(() => FileAssetType)
  @Field(() => FileAssetType)
  assetType: FileAssetType;

  @Property()
  @Field()
  mimeType: string;

  @Property()
  generated: boolean;

  @Property({ nullable: true })
  @Field({ nullable: true, description: "The milliseconds into the file that the asset was generated from" })
  position?: number;

  @Property()
  @Field()
  width?: number;

  @Property()
  @Field()
  height?: number;

  @ManyToOne(() => FileEntity, { ref: true })
  file: Ref<FileEntity>;

  getPath() {
    const extension = mime.extension(this.mimeType) || "bin";
    const name = this.getName();
    return join(config.metadata_dir, "assets", this.file.id, `${name}.${extension}`);
  }

  getName(): string {
    switch (this.assetType) {
      case FileAssetType.Poster:
        return "poster";
      case FileAssetType.Thumbnail:
        return "thumbnail";
      case FileAssetType.Timeline:
        return "timeline";
    }
  }
}
