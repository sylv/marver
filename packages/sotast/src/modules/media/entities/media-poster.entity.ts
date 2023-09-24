import { Entity, Property } from '@mikro-orm/core';
import { ObjectType } from '@nestjs/graphql';
import mime from 'mime-types';
import { join } from 'path';
import { MediaAssetEntity } from './media-asset.entity.js';
import { FileEntity } from '../../file/entities/file.entity.js';

@Entity()
@ObjectType('MediaPoster')
export class MediaPosterEntity extends MediaAssetEntity {
  @Property()
  generated: boolean;

  @Property({ nullable: true })
  fromMs?: number;

  @Property({ persist: false })
  get path() {
    const extension = mime.extension(this.mimeType);
    return join(FileEntity.getMetadataFolder(this.media.file.id), `poster.${extension}`);
  }
}
