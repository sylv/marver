import { type ObjectQuery } from '@mikro-orm/core';
import bytes from 'bytes';
import { type FileEntity } from '../modules/file/entities/file.entity.js';
import { TagColorPresets } from '../modules/file/entities/tag.entity.js';

export interface VirtualTag {
  name: string;
  description: string;
  color?: TagColorPresets;
  check: (file: FileEntity) => boolean;
  set?: (file: FileEntity) => void;
  filter: ObjectQuery<FileEntity>;
}

export const VIRTUAL_TAGS: VirtualTag[] = [
  {
    name: 'unavailable',
    description: 'Whether this file is unavailable.',
    color: TagColorPresets.Red,
    check: (file) => file.info.unavailable,
    filter: {
      info: {
        unavailable: true,
      },
    },
  },
  {
    name: 'corrupted',
    description: 'Whether this file is corrupted.',
    color: TagColorPresets.Red,
    check: (file) => file.info.corrupted,
    filter: {
      info: { corrupted: true },
    },
  },
  {
    name: 'has_faces',
    description: 'Whether this file has faces.',
    check: (file) => !!file.media?.hasFaces,
    filter: {
      media: { hasFaces: true },
    },
  },
  {
    name: 'absurdres',
    description: 'Whether this file has a resolution that is absurdly high.',
    check: (file) => {
      if (!file.media) return false;
      if (!file.media.width || !file.media.height) return false;
      return file.media.width > 3200 || file.media.height > 2400;
    },
    filter: {
      media: { width: { $gt: 3200 }, height: { $gt: 2400 } },
    },
  },
  {
    name: 'highres',
    description: 'Whether this file has a resolution that is high.',
    check: (file) => {
      if (!file.media) return false;
      if (!file.media.width || !file.media.height) return false;
      return file.media.width > 1600 || file.media.height > 1200;
    },
    filter: {
      media: { width: { $gt: 1600 }, height: { $gt: 1200 } },
    },
  },
  {
    name: 'lowres',
    description: 'Whether this file has a resolution that is low.',
    check: (file) => {
      if (!file.media) return false;
      if (!file.media.width || !file.media.height) return false;
      return file.media.width < 640 || file.media.height < 480;
    },
    filter: {
      media: { width: { $lt: 640 }, height: { $lt: 480 } },
    },
  },
  {
    name: 'huge_filesize',
    description: 'Whether this file has a filesize that is huge.',
    check: (file) => file.info.size > bytes('10MB'),
    filter: {
      info: { size: { $gt: bytes('10MB') } },
    },
  },
];

export const VIRTUAL_TAG_NAMES = new Set(VIRTUAL_TAGS.map((tag) => tag.name));
