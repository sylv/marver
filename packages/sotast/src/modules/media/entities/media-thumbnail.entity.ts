import { Entity, Property } from '@mikro-orm/core';
import { ObjectType } from '@nestjs/graphql';
import mime from 'mime-types';
import { join } from 'path';
import { MediaAssetEntity } from './media-asset.entity.js';
import { FileEntity } from '../../file/entities/file.entity.js';

@Entity()
@ObjectType('MediaThumbnail')
export class MediaThumbnailEntity extends MediaAssetEntity {
  @Property({ persist: false })
  get path() {
    if (!this.mimeType) throw new Error('Thumbnail is not initialized');
    const extension = mime.extension(this.mimeType);
    if (!extension) throw new Error(`Could not determine extension for mime type ${this.mimeType}`);
    return join(FileEntity.getMetadataFolder(this.media.file.id), `thumbnail.${extension}`);
  }
}
