import { Entity, Property } from '@mikro-orm/better-sqlite';
import { ObjectType } from '@nestjs/graphql';
import mime from 'mime-types';
import { join } from 'path';
import { FileEntity } from '../file.entity.js';
import { FileAssetEntity } from './file-asset.entity.js';

@Entity({ tableName: 'file_thumbnails' })
@ObjectType('FileThumbnail')
export class FileThumbnailEntity extends FileAssetEntity {
  @Property({ persist: false })
  get path() {
    const extension = mime.extension(this.mimeType) || 'bin';
    const assetFolder = FileEntity.getAssetFolder(this.file.id);
    return join(assetFolder, `thumbnail.${extension}`);
  }
}
