import { Embeddable, Property } from '@mikro-orm/core';
import { Field, ObjectType } from '@nestjs/graphql';
import { type BoundingBox } from '../../../generated/sentry.js';

@Embeddable()
@ObjectType('BoundingBox')
export class BoundingBoxEmbed implements BoundingBox {
  @Property()
  @Field()
  x1: number;

  @Property()
  @Field()
  y1: number;

  @Property()
  @Field()
  x2: number;

  @Property()
  @Field()
  y2: number;
}
