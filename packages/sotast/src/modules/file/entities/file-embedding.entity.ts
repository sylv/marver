import { Entity, ManyToOne, PrimaryKey, Property, type Ref } from "@mikro-orm/core";
import { FileEntity } from "./file.entity";
import { VectorType } from "../../../vector.type";

@Entity({ tableName: "file_embedding" })
export class FileEmbeddingEntity {
  @PrimaryKey({ autoincrement: true })
  id: number;

  @ManyToOne(() => FileEntity, { ref: true })
  file: Ref<FileEntity>;

  @Property({ nullable: true })
  position?: number;

  @Property({ type: new VectorType("FB16_BLOB", 768), lazy: true })
  data: number[];
}
