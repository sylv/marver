import { Entity, OneToOne, OptionalProps, Property, type Ref } from '@mikro-orm/core';
import { Field, ObjectType } from '@nestjs/graphql';
import { Media } from './media.entity.js';

@Entity({ abstract: true })
@ObjectType({ isAbstract: true })
export abstract class MediaAsset {
  @OneToOne(() => Media, { primary: true, ref: true })
  media: Ref<Media>;

  @Property()
  @Field()
  mimeType: string;

  @Property()
  @Field()
  width: number;

  @Property()
  @Field()
  height: number;

  [OptionalProps]: 'path';
}
