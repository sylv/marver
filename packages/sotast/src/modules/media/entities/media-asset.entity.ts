import { Entity, OneToOne, OptionalProps, Property, type Ref } from '@mikro-orm/core';
import { Field, ObjectType } from '@nestjs/graphql';
import { MediaEntity } from './media.entity.js';

@Entity({ abstract: true })
@ObjectType({ isAbstract: true })
export abstract class MediaAssetEntity {
  @OneToOne(() => MediaEntity, { primary: true, ref: true })
  media: Ref<MediaEntity>;

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
