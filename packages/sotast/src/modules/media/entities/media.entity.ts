import {
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryKeyProp,
  PrimaryKeyType,
  Property,
  type Ref,
  type Rel,
} from '@mikro-orm/core';
import { Field, ObjectType } from '@nestjs/graphql';
import ms from 'ms';
import { Connection } from 'nest-graphql-utils';
import { FileEntity } from '../../file/entities/file.entity.js';
import {
  MetadataEntity,
  type MetadataEntityUnion,
} from '../../metadata/entities/metadata.entity.js';
import { FaceEntity } from '../../people/entities/face.entity.js';
import { MediaEmbeddingEntity } from './media-embedding.js';
import { MediaExifDataEntity } from './media-exif.entity.js';
import { MediaPerceptualHashEntity } from './media-perceptual-hash.entity.js';
import { MediaPosterEntity } from './media-poster.entity.js';
import { MediaSubtitleEntity } from './media-subtitle.entity.js';
import { MediaTextEntity } from './media-text.entity.js';
import { MediaThumbnailEntity } from './media-thumbnail.entity.js';
import { MediaTimelineEntity } from './media-timeline.entity.js';

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
@ObjectType('Media')
export class MediaEntity extends MediaSortingProps {
  @OneToOne(() => FileEntity, { primary: true, eager: true })
  @Field(() => FileEntity)
  file: Rel<FileEntity>;

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

  @OneToMany(() => MediaEmbeddingEntity, (vector) => vector.media, { eager: true })
  vectors = new Collection<MediaEmbeddingEntity>(this);

  /** Thumbhash-computed preview */
  // todo: this should be lazy-loaded, only if graphql requests it.
  @Property({ type: 'blob', nullable: true })
  preview?: Buffer;

  @OneToOne(() => MediaThumbnailEntity, (thumbnail) => thumbnail.media, {
    ref: true,
    nullable: true,
  })
  @Field(() => MediaThumbnailEntity)
  thumbnail?: Ref<MediaThumbnailEntity>;

  @OneToOne(() => MediaTimelineEntity, (timeline) => timeline.media, { ref: true, nullable: true })
  @Field(() => MediaTimelineEntity)
  timeline?: Ref<MediaTimelineEntity>;

  @OneToOne(() => MediaPosterEntity, (poster) => poster.media, { ref: true, nullable: true })
  @Field(() => MediaPosterEntity)
  poster?: Ref<MediaPosterEntity>;

  @OneToOne(() => MetadataEntity, { ref: true, nullable: true })
  metadata?: Ref<MetadataEntityUnion>;

  @OneToOne(() => MediaExifDataEntity, (exif) => exif.media, { ref: true, nullable: true })
  @Field(() => MediaExifDataEntity, { nullable: true })
  exifData?: Ref<MediaExifDataEntity>;

  @OneToMany(() => MediaSubtitleEntity, (subtitle) => subtitle.media)
  @Field(() => [MediaSubtitleEntity])
  subtitles = new Collection<MediaSubtitleEntity>(this);

  @OneToMany(() => MediaPerceptualHashEntity, (phash) => phash.media)
  perceptualHashes = new Collection<MediaPerceptualHashEntity>(this);

  @OneToMany(() => FaceEntity, (face) => face.media)
  @Field(() => [FaceEntity])
  faces = new Collection<FaceEntity>(this);

  @OneToMany(() => MediaTextEntity, (text) => text.media)
  @Field(() => [MediaTextEntity])
  texts = new Collection<MediaTextEntity>(this);

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
export class MediaConnection extends Connection(MediaEntity, {
  edgeName: 'MediaEdge',
}) {}
