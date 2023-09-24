import {
  Collection,
  Embedded,
  Entity,
  Formula,
  OneToMany,
  OneToOne,
  OptionalProps,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import mime from 'mime-types';
import { Connection } from 'nest-graphql-utils';
import { extname, join } from 'path';
import { ulid } from 'ulid';
import { config } from '../../../config.js';
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '../../../constants.js';
import { MediaEntity } from '../../media/entities/media.entity.js';
import { TaskEntity } from '../../tasks/task.entity.js';
import { FileInfoEmbeddable } from './file-info.embeddable.js';
import { FileTagEntity } from './file-tag.entity.js';

@Entity()
@ObjectType('File')
export class FileEntity {
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

  @OneToMany(() => FileTagEntity, (tag) => tag.file)
  tags = new Collection<FileTagEntity>(this);

  @Embedded(() => FileInfoEmbeddable)
  @Field(() => FileInfoEmbeddable)
  info: FileInfoEmbeddable;

  @OneToOne(() => MediaEntity, (media) => media.file, {
    nullable: true,
    eager: true,
    onDelete: 'set null',
  })
  @Field(() => MediaEntity, { nullable: true })
  media?: MediaEntity;

  @OneToMany(() => TaskEntity, (task) => task.file)
  tasks = new Collection<TaskEntity>(this);

  @Property({ type: () => String, nullable: true })
  @Field(() => String, { nullable: true })
  get mimeType() {
    if (!this.path) return;
    if (this.path.endsWith('jfif')) return 'image/jpeg';
    return mime.lookup(this.path) || null;
  }

  @Property({ type: () => String, nullable: true })
  @Field(() => String, { nullable: true })
  get extension() {
    if (!this.path) return;
    return extname(this.path).slice(1) || null;
  }

  /**
   * The folder where additional resources for this file should be stored.
   * For example, thumbnails that are generated for this file.
   */
  @Property({ persist: false })
  get metadataFolder() {
    // this.id is the only field guaranteed to be loaded.
    // all others could be filtered out by the query, or may not
    // have been set yet, introducing subtle bugs and data being put in the wrong place.
    const self = this as { id: string };
    return FileEntity.getMetadataFolder(self.id);
  }

  @Property({ persist: false })
  get isKnownType() {
    const ext = this.extension;
    if (!ext) return false;
    if (IMAGE_EXTENSIONS.has(ext)) return true;
    if (VIDEO_EXTENSIONS.has(ext)) return true;
    return false;
  }

  static getMetadataFolder(id: string) {
    const lastTwoChars = id.slice(-2);
    return join(config.metadata_dir, 'file_metadata', lastTwoChars, id);
  }

  [OptionalProps]: 'name' | 'metadataFolder' | 'directory' | 'isKnownType';
}

@ObjectType()
export class FileConnection extends Connection(FileEntity, {
  edgeName: 'FileEdge',
}) {}
