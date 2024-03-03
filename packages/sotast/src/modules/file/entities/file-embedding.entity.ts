import { Entity, ManyToOne, PrimaryKey, Property, Unique, type Ref } from '@mikro-orm/core';
import { FileEntity } from './file.entity';

@Entity({ tableName: 'file_embedding' })
@Unique({ properties: ['file', 'primary'] })
export class FileEmbeddingEntity {
  @PrimaryKey({ autoincrement: true })
  id: number;

  @ManyToOne(() => FileEntity, { ref: true })
  file: Ref<FileEntity>;

  @Property()
  primary: boolean;

  @Property({ type: 'blob' })
  data: Buffer;
}
