import { Embeddable, Property } from '@mikro-orm/core';
import { Field, ObjectType } from '@nestjs/graphql';

@Embeddable()
@ObjectType()
export class FileMetadata {
  @Field()
  @Property()
  size: number;

  @Field()
  @Property()
  corrupted: boolean = false;

  @Field()
  @Property()
  unavailable: boolean = false;

  @Field()
  @Property()
  favourite: boolean = false;

  @Property()
  @Field()
  serverCheckedAt: Date = new Date();

  @Property()
  @Field()
  serverCreatedAt: Date = new Date();

  @Property()
  @Field()
  diskModifiedAt: Date;

  @Property()
  @Field()
  diskCreatedAt: Date;
}
