import { Embeddable, Index, Property } from '@mikro-orm/better-sqlite';
import { Field, ObjectType } from '@nestjs/graphql';
import ms from 'ms';

@Embeddable()
@ObjectType('FileInfo')
export class FileInfoEmbeddable {
  @Property({ nullable: true })
  @Field({ nullable: true })
  @Index()
  height?: number;

  @Property({ nullable: true })
  @Field({ nullable: true })
  @Index()
  width?: number;

  @Property({ nullable: true })
  @Field({ nullable: true })
  videoCodec?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  bitrate?: number;

  @Property({ nullable: true })
  @Field({ nullable: true })
  framerate?: number;

  @Property({ nullable: true })
  @Field({ nullable: true })
  durationSeconds?: number;

  @Property({ nullable: true })
  @Field({ nullable: true })
  audioChannels?: number;

  @Property({ nullable: true })
  @Field({
    nullable: true,
    description: 'Whether no subtitles could be generated from the audio on this video',
  })
  nonVerbal?: boolean;

  @Property({ nullable: true })
  @Field({
    nullable: true,
    description: 'Whether text coudl be found in the image or video',
  })
  hasText?: boolean;

  @Property({ nullable: true })
  @Field({ nullable: true })
  audioCodec?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  hasEmbeddedSubtitles?: boolean;

  @Property({ nullable: true })
  @Field({ nullable: true })
  hasFaces?: boolean;

  @Property({ nullable: true })
  @Field({ nullable: true })
  isAnimated?: boolean;

  @Property({ nullable: true, persist: false, type: 'string' })
  @Field(() => String, { nullable: true })
  get durationFormatted() {
    if (!this.durationSeconds) return null;
    if (this.durationSeconds < 1) return '1s';
    return ms(Math.round(this.durationSeconds * 1000));
  }
}
