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
import { Media } from '../../media/entities/media.entity.js';
import { FileMetadata } from './file-metadata.embeddable.js';
import { FileTag } from './file-tag.entity.js';

@ObjectType()
@Entity()
export class File {
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

  @OneToMany(() => FileTag, (tag) => tag.file)
  tags = new Collection<FileTag>(this);

  @Embedded(() => FileMetadata)
  @Field(() => FileMetadata)
  metadata: FileMetadata;

  @OneToOne(() => Media, { nullable: true, eager: true, onDelete: 'set null' })
  @Field(() => Media, { nullable: true })
  media?: Media;

  @Property({ type: () => String, nullable: true })
  @Field(() => String, { nullable: true })
  get mimeType() {
    if (this.path.endsWith('jfif')) return 'image/jpeg';
    return mime.lookup(this.path) || null;
  }

  @Property({ type: () => String, nullable: true })
  @Field(() => String, { nullable: true })
  get extension() {
    return extname(this.path).slice(1) || null;
  }

  @Property({ persist: false })
  get metadataFolder() {
    // note: this must work with only this.id loaded,
    // because sometimes refs won't be loaded but we still
    // need the meta dir.
    return File.getMetadataFolder(this.id);
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
export class FileConnection extends Connection(File) {}
