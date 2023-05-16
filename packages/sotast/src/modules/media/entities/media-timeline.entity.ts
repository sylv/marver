import { Entity, Property } from '@mikro-orm/core';
import { ObjectType } from '@nestjs/graphql';
import mime from 'mime-types';
import { join } from 'path';
import { MediaAsset } from './media-asset.entity.js';
import { File } from '../../file/entities/file.entity.js';

@Entity()
@ObjectType()
export class MediaTimeline extends MediaAsset {
  @Property({ persist: false })
  get path() {
    const extension = mime.extension(this.mimeType);
    return join(File.getMetadataFolder(this.media.file.id), `timeline.${extension}`);
  }
}
