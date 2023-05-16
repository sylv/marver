import { Entity, Filter, ManyToOne, Property, type Ref } from '@mikro-orm/core';
import { Tag } from './tag.entity.js';
import { File } from './file.entity.js';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
@Filter({
  name: 'match_percent',
  cond: {
    matchPercent: {
      $gte: 0.75,
    },
  },
})
export class FileTag {
  @ManyToOne(() => Tag, { primary: true })
  @Field(() => Tag)
  tag: Ref<Tag>;

  @ManyToOne(() => File, { primary: true })
  file: Ref<File>;

  @Property()
  @Field()
  system: boolean;

  @Property({ nullable: true })
  matchPercent: number;
}
