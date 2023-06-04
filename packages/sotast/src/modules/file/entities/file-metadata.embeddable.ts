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

  /**
   * This is the best guess at the time the file was really created.
   * It will default to the diskCreatedAt, but can be modified to be more accurate.
   * For example, exif metadata may reveal a better date, or OCR may find a date in the image.
   */
  @Property()
  @Field()
  createdAt: Date;
}
