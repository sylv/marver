import {
  Collection,
  Embedded,
  Entity,
  Formula,
  Index,
  OneToMany,
  OneToOne,
  OptionalProps,
  PrimaryKey,
  Property,
  Unique,
  type Ref,
} from '@mikro-orm/better-sqlite';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import mime from 'mime-types';
import { Connection } from 'nest-graphql-utils';
import { extname, join } from 'path';
import { ulid } from 'ulid';
import { config } from '../../../config.js';
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '../../../constants.js';
import { FaceEntity } from '../../people/entities/face.entity.js';
import { FilePosterEntity } from './assets/file-poster.entity.js';
import { FileThumbnailEntity } from './assets/file-thumbnail.entity.js';
import { FileTimelineEntity } from './assets/file-timeline.entity.js';
import { FileExifDataEntity } from './file-exif.entity.js';
import { FileInfoEmbeddable } from './file-info.entity.js';
import { FilePerceptualHashEntity } from './file-perceptual-hash.entity.js';
import { FileTagEntity } from './file-tag.entity.js';
import { FileTextEntity } from './file-text.entity.js';
import { JobStateEntity } from '../../queue/job-state.entity.js';

// when using raw queries in a query builder,
// .addSelect(raw('COUNT(*) as count'))
// mikroorm throws an error about the field not existing if you try order
// by that field, because it doesnt know the "count" property exists.
// this works around that.
@Entity({ abstract: true })
export class FileEntityFilter {
  @Property({ persist: false })
  similarity?: number;
}

@Entity({ tableName: 'files' })
@ObjectType('File')
export class FileEntity extends FileEntityFilter {
  @PrimaryKey()
  @Field(() => ID)
  id: string = ulid();

  @Formula((alias) => `path_basename(${alias}.path)`)
  @Field()
  name: string;

  @Formula((alias) => `path_dirname(${alias}.path)`)
  @Field()
  directory: string;

  @Property()
  @Unique()
  @Field()
  path: string;

  @Field()
  @Property()
  corrupted: boolean = false;

  @Field()
  @Property()
  @Index()
  unavailable: boolean = false;

  @Field()
  @Property()
  @Index()
  size: number;

  @Property({ nullable: true, type: 'blob' })
  embedding?: Buffer;

  /** Thumbhash-computed preview */
  // todo: this should be lazy-loaded, only if graphql requests it.
  @Property({ type: 'blob', nullable: true })
  preview?: Buffer;

  @Property()
  @Field()
  checkedAt: Date = new Date();

  @Property()
  @Field()
  indexedAt: Date = new Date();

  @Property()
  @Field()
  modifiedAt: Date;

  @Property()
  @Field()
  createdAt: Date;

  @Embedded(() => FileInfoEmbeddable)
  @Field(() => FileInfoEmbeddable)
  info: FileInfoEmbeddable;

  @OneToMany(() => FileTagEntity, (tag) => tag.file)
  tags = new Collection<FileTagEntity>(this);

  @OneToOne(() => FileThumbnailEntity, (thumbnail) => thumbnail.file, { ref: true, nullable: true })
  @Field(() => FileThumbnailEntity)
  thumbnail?: Ref<FileThumbnailEntity>;

  @OneToOne(() => FilePosterEntity, (poster) => poster.file, { ref: true, nullable: true })
  @Field(() => FilePosterEntity)
  poster?: Ref<FilePosterEntity>;

  @OneToOne(() => FileTimelineEntity, (timeline) => timeline.file, { ref: true, nullable: true })
  @Field(() => FileTimelineEntity)
  timeline?: Ref<FileTimelineEntity>;

  @OneToOne(() => FileExifDataEntity, (exif) => exif.file, { ref: true, nullable: true })
  @Field(() => FileExifDataEntity, { nullable: true })
  exifData?: Ref<FileExifDataEntity>;

  @OneToMany(() => FilePerceptualHashEntity, (phash) => phash.file)
  perceptualHashes = new Collection<FilePerceptualHashEntity>(this);

  @OneToMany(() => FaceEntity, (face) => face.file)
  @Field(() => [FaceEntity])
  faces = new Collection<FaceEntity>(this);

  @OneToMany(() => FileTextEntity, (text) => text.file)
  @Field(() => [FileTextEntity])
  texts = new Collection<FileTextEntity>(this);

  @OneToMany(() => JobStateEntity, (jobState) => jobState.file)
  jobStates = new Collection<JobStateEntity>(this);

  @Property({ type: () => String, nullable: true })
  @Field(() => String, { nullable: true })
  get mimeType() {
    if (!this.path) return;
    if (this.path.endsWith('jfif')) return 'image/jpeg';
    return mime.lookup(this.path) || null;
  }

  @Property({ type: () => String, nullable: true })
  @Field(() => String, { nullable: true })
  @Index()
  get extension() {
    if (!this.path) return;
    return extname(this.path).slice(1).toLowerCase() || null;
  }

  /**
   * The folder where additional resources for this file should be stored.
   * For example, thumbnails that are generated for this file.
   */
  @Property({ persist: false })
  get assetFolder() {
    // this.id is the only field guaranteed to be loaded.
    // all others could be filtered out by the query, or may not
    // have been set yet, introducing subtle bugs and data being put in the wrong place.
    const self = this as { id: string };
    return FileEntity.getAssetFolder(self.id);
  }

  @Property({ persist: false })
  get isSupportedMimeType() {
    const ext = this.extension;
    if (!ext) return false;
    if (IMAGE_EXTENSIONS.has(ext)) return true;
    if (VIDEO_EXTENSIONS.has(ext)) return true;
    return false;
  }

  static getAssetFolder(id: string) {
    const lastTwoChars = id.slice(-2);
    return join(config.metadata_dir, 'file_metadata', lastTwoChars, id);
  }

  [OptionalProps]:
    | 'name'
    | 'assetFolder'
    | 'directory'
    | 'isSupportedMimeType'
    | 'corrupted'
    | 'unavailable'
    | 'checkedAt'
    | 'indexedAt';
}

@ObjectType()
export class FileConnection extends Connection(FileEntity, {
  edgeName: 'FileEdge',
}) {}
