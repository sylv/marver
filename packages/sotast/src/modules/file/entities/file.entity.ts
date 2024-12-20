import {
  Collection,
  Embedded,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  OptionalProps,
  PrimaryKey,
  Property,
  Uint8ArrayType,
  Unique,
  type Ref,
} from "@mikro-orm/libsql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import mime from "mime-types";
import { Connection } from "nest-graphql-utils";
import { ulid } from "ulid";
import { config } from "../../../config.js";
import { AutoPopulate } from "../../../helpers/autoloader.js";
import { FileEmbeddingEntity } from "./file-embedding.entity.js";
import { FileExifDataEntity } from "./file-exif.entity.js";
import { FileInfoEmbeddable } from "./file-info.entity.js";
import { FileAssetEntity } from "./file-asset.entity.js";
import { basename } from "path";
import { JobStateEntity } from "../../queue/job-state.entity.js";

@Entity({ tableName: "files" })
@ObjectType("File")
export class FileEntity {
  @PrimaryKey({ type: "string" })
  @Field(() => ID)
  id: string = ulid();

  @Property()
  @Field()
  displayName: string;

  @Property()
  @Field()
  directory: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  extension?: string;

  @Property()
  @Unique()
  @Field()
  path: string;

  @Field()
  @Property()
  corrupted: boolean = false;

  @Field()
  @Property()
  @Index()
  unavailable: boolean = false;

  @Field()
  @Property()
  @Index()
  size: number;

  @Property()
  @Field()
  checkedAt: Date = new Date();

  @Property()
  @Field()
  indexedAt: Date = new Date();

  @Property()
  @Field()
  modifiedAt: Date;

  @Property()
  @Field()
  createdAt: Date;

  @Property({ nullable: true })
  @Field({ nullable: true })
  bumpedAt?: Date;

  @Embedded(() => FileInfoEmbeddable)
  @Field(() => FileInfoEmbeddable)
  info: FileInfoEmbeddable;

  @AutoPopulate()
  @Field(() => FileAssetEntity)
  @OneToOne(() => FileAssetEntity, { ref: true, nullable: true })
  thumbnail?: Ref<FileAssetEntity>;

  @Property({ type: Uint8ArrayType, ref: true, lazy: true, nullable: true })
  preview?: Ref<Uint8Array>;

  @AutoPopulate()
  @Field(() => FileExifDataEntity, { nullable: true })
  @OneToOne(
    () => FileExifDataEntity,
    (exif) => exif.file,
    { ref: true, nullable: true },
  )
  exifData?: Ref<FileExifDataEntity>;

  @AutoPopulate()
  @Field(() => [JobStateEntity])
  @OneToMany(
    () => JobStateEntity,
    (jobState) => jobState.file,
  )
  jobStates = new Collection<JobStateEntity>(this);

  @OneToMany(
    () => FileEmbeddingEntity,
    (embedding) => embedding.file,
  )
  embeddings = new Collection<FileEmbeddingEntity>(this);

  @Field(() => String, { nullable: true })
  get mimeType() {
    if (!this.path) return undefined;
    if (this.path.endsWith("jfif")) return "image/jpeg";
    return mime.lookup(this.path) || undefined;
  }

  @Field(() => String)
  get fileName() {
    return basename(this.path);
  }

  tryGetRelativePath() {
    const source = config.source_dirs.find((dir) => this.path.startsWith(dir));
    if (source) {
      return this.path.slice(source.length);
    }

    return this.path;
  }

  [OptionalProps]: "corrupted" | "unavailable" | "checkedAt" | "indexedAt" | "fileName" | "mimeType";
}

@ObjectType()
export class FileConnection extends Connection(FileEntity, {
  edgeName: "FileEdge",
}) {}
