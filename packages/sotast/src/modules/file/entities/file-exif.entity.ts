import { Entity, Index, OneToOne, Property, type Ref } from '@mikro-orm/better-sqlite';
import { Field, ObjectType } from '@nestjs/graphql';
import { FileEntity } from './file.entity.js';

@Entity()
@ObjectType('FileExifData')
export class FileExifDataEntity {
  @OneToOne(() => FileEntity, { primary: true, ref: true })
  file: Ref<FileEntity>;

  @Property({ nullable: true })
  @Field({ nullable: true })
  lensMake?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  lensModel?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  cameraMake?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  cameraModel?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  focalLength?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  exposureTime?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  fNumber?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  iso?: number;

  @Property({ nullable: true })
  @Field({ nullable: true })
  flash?: string;

  @Property({ type: 'date', nullable: true })
  @Field(() => Date, { nullable: true })
  dateTime?: Date;

  @Property({ type: 'float', nullable: true })
  @Field({ nullable: true })
  @Index()
  longitude?: number;

  @Property({ type: 'float', nullable: true })
  @Field({ nullable: true })
  @Index()
  latitude?: number;
}
