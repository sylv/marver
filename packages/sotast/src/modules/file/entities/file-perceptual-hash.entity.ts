import { Entity, ManyToOne, PrimaryKey, Property, type Ref } from '@mikro-orm/better-sqlite';
import { Field, ID } from '@nestjs/graphql';
import { FileEntity } from './file.entity.js';

@Entity({ tableName: 'file_perceptual_hashes' })
export class FilePerceptualHashEntity {
  @PrimaryKey({ autoincrement: true })
  @Field(() => ID)
  id: number;

  @ManyToOne(() => FileEntity, { ref: true })
  file: Ref<FileEntity>;

  @Property({ type: 'blob' })
  hash: Buffer;

  @Property({ nullable: true })
  fromMs?: number;

  @Property({ nullable: true })
  toMs?: number;
}
