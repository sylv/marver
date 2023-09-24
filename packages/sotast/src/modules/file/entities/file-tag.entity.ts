import { Entity, Filter, ManyToOne, Property, type Ref } from '@mikro-orm/core';
import { TagEntity } from './tag.entity.js';
import { FileEntity } from './file.entity.js';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('FileTag')
@Entity()
@Filter({
  name: 'match_percent',
  cond: {
    matchPercent: {
      $gte: 0.75,
    },
  },
})
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
  matchPercent: number;
}
