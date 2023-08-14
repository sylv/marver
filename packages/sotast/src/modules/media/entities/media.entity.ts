import {
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryKeyProp,
  PrimaryKeyType,
  Property,
  type Ref,
} from '@mikro-orm/core';
import { Field, ObjectType } from '@nestjs/graphql';
import ms from 'ms';
import { Connection } from 'nest-graphql-utils';
import { File } from '../../file/entities/file.entity.js';
import { Face } from '../../people/entities/face.entity.js';
import { MediaExifData } from './media-exif.entity.js';
import { MediaPerceptualHash } from './media-perceptual-hash.entity.js';
import { MediaPoster } from './media-poster.entity.js';
import { MediaSubtitle } from './media-subtitle.entity.js';
import { MediaThumbnail } from './media-thumbnail.entity.js';
import { MediaTimeline } from './media-timeline.entity.js';
import { MediaVector } from './media-vector.entity.js';

/** This is necessary for MikroORM property validation to pass when ordering by similarity, a computed property. */
@ObjectType({ isAbstract: true })
abstract class MediaSortingProps {
  @Property({ persist: false })
  similarity?: number;

  @Property({ persist: false })
  recent?: number;

  @Property({ persist: false })
  count?: number;
}

@Entity()
@ObjectType()
export class Media extends MediaSortingProps {
  @OneToOne(() => File, { primary: true, eager: true })
  @Field(() => File)
  file: File;

  @Property({ nullable: true })
  @Field({ nullable: true })
  height?: number;

  @Property({ nullable: true })
  @Field({ nullable: true })
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

  @OneToMany(() => MediaVector, (vector) => vector.media, { eager: true })
  vectors = new Collection<MediaVector>(this);

  /** Thumbhash-computed preview */
  // todo: this should be lazy-loaded, only if graphql requests it.
  @Property({ type: 'blob', nullable: true })
  preview?: Buffer;

  @OneToOne(() => MediaThumbnail, (thumbnail) => thumbnail.media, { ref: true, nullable: true })
  @Field(() => MediaThumbnail)
  thumbnail?: Ref<MediaThumbnail>;

  @OneToOne(() => MediaTimeline, (timeline) => timeline.media, { ref: true, nullable: true })
  @Field(() => MediaTimeline)
  timeline?: Ref<MediaTimeline>;

  @OneToOne(() => MediaPoster, (poster) => poster.media, { ref: true, nullable: true })
  @Field(() => MediaPoster)
  poster?: Ref<MediaPoster>;

  @OneToOne(() => MediaExifData, (exif) => exif.media, { ref: true, nullable: true })
  @Field(() => MediaExifData, { nullable: true })
  exifMetadata?: Ref<MediaExifData>;

  @OneToMany(() => MediaSubtitle, (subtitle) => subtitle.media)
  @Field(() => [MediaSubtitle])
  subtitles = new Collection<MediaSubtitle>(this);

  @OneToMany(() => MediaPerceptualHash, (phash) => phash.media)
  perceptualHashes = new Collection<MediaPerceptualHash>(this);

  @OneToMany(() => Face, (face) => face.media)
  @Field(() => [Face])
  faces = new Collection<Face>(this);

  @Property({ nullable: true, persist: false, type: 'string' })
  @Field(() => String, { nullable: true })
  get durationFormatted() {
    if (!this.durationSeconds) return null;
    return ms(this.durationSeconds * 1000);
  }

  [PrimaryKeyProp]: 'file';
  [PrimaryKeyType]: string;
}

@ObjectType()
export class MediaConnection extends Connection(Media) {}
