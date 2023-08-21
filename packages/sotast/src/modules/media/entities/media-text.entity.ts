import { Embedded, Entity, Enum, ManyToOne, PrimaryKey, Property, type Ref } from '@mikro-orm/core';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BoundingBoxEmbed } from '../../people/entities/bounding-box.embeddable.js';
import { Media } from './media.entity.js';

export enum MediaTextType {
  OCR, // For text extracted via OCR
  Manual, // For text manually entered by a user
  Translated, // For text translated from another MediaText entity (e.g, translating the OCR result from German to English)
}

registerEnumType(MediaTextType, { name: 'MediaTextType' });

@Entity()
@ObjectType()
export class MediaText {
  @PrimaryKey({ autoincrement: true })
  @Field()
  id: number;

  @ManyToOne(() => Media, { ref: true })
  media: Ref<Media>;

  @Enum(() => MediaTextType)
  @Field()
  type: MediaTextType;

  @Property()
  @Field()
  text: string;

  @Embedded(() => BoundingBoxEmbed)
  @Field(() => BoundingBoxEmbed)
  boundingBox: BoundingBoxEmbed;

  @Property()
  @Field()
  confidence: number;

  // language code or some other identifier for this "group" of text
  @Property({ nullable: true })
  @Field({ nullable: true })
  code?: string;

  // for videos, the timestamp of the text
  @Property({ nullable: true })
  @Field({ nullable: true })
  timestamp?: number;
}
