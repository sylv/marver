import { Entity, Property } from '@mikro-orm/better-sqlite';
import { ObjectType } from '@nestjs/graphql';
import mime from 'mime-types';
import { join } from 'node:path';
import { FileAssetEntity } from './file-asset.entity.js';
import { FileEntity } from '../file.entity.js';

@Entity({ tableName: 'file_timelines' })
@ObjectType('FileTimeline')
export class FileTimelineEntity extends FileAssetEntity {
  @Property({ persist: false })
  get path() {
    const extension = mime.extension(this.mimeType) || 'bin';
    const assetFolder = FileEntity.getAssetFolder(this.file.id);
    return join(assetFolder, `timeline.${extension}`);
  }
}
