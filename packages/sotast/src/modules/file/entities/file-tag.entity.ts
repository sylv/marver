import { Entity, ManyToOne, Property, type Ref } from '@mikro-orm/better-sqlite';
import { Field, ObjectType } from '@nestjs/graphql';
import { FileEntity } from './file.entity.js';
import { TagEntity } from './tag.entity.js';

@Entity({ tableName: 'file_tags' })
@ObjectType('FileTag')
export class FileTagEntity {
  @ManyToOne(() => TagEntity, { primary: true })
  @Field(() => TagEntity)
  tag: Ref<TagEntity>;

  @ManyToOne(() => FileEntity, { primary: true })
  file: Ref<FileEntity>;

  @Property()
  @Field()
  system: boolean;

  @Property({ nullable: true })
  matchPercent?: number;
}
