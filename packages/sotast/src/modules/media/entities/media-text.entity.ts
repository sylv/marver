import { Embedded, Entity, Enum, ManyToOne, PrimaryKey, Property, type Ref } from '@mikro-orm/core';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BoundingBoxEmbeddable } from '../../people/entities/bounding-box.embeddable.js';
import { MediaEntity } from './media.entity.js';

export enum MediaTextType {
  OCR, // For text extracted via OCR
  Cleaned, // OCR text after its cleaned automatically by an LLM
  Manual, // For text manually entered by a user
  Translated, // For text translated from another MediaText entity (e.g, translating the OCR result from German to English)
}

registerEnumType(MediaTextType, { name: 'MediaTextType' });

@Entity()
@ObjectType('MediaText')
export class MediaTextEntity {
  @PrimaryKey({ autoincrement: true })
  @Field(() => ID)
  id: number;

  @ManyToOne(() => MediaEntity, { ref: true })
  media: Ref<MediaEntity>;

  @Enum(() => MediaTextType)
  @Field()
  type: MediaTextType;

  @Property()
  @Field()
  text: string;

  @Embedded(() => BoundingBoxEmbeddable)
  @Field(() => BoundingBoxEmbeddable)
  boundingBox: BoundingBoxEmbeddable;

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
