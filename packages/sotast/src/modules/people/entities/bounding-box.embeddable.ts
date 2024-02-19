import { Embeddable, Property } from '@mikro-orm/better-sqlite';
import { Field, ObjectType } from '@nestjs/graphql';
import type { BoundingBox } from '../../../@generated/core.js';

@Embeddable()
@ObjectType('BoundingBox')
export class BoundingBoxEmbeddable implements BoundingBox {
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
