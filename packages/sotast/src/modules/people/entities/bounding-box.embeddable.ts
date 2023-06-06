import { Embeddable, Property } from '@mikro-orm/core';
import { Field, ObjectType } from '@nestjs/graphql';

@Embeddable()
@ObjectType()
export class BoundingBox {
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
