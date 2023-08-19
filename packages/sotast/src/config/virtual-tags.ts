import bytes from 'bytes';
import { File } from '../modules/file/entities/file.entity.js';
import { TagColorPresets } from '../modules/file/entities/tag.entity.js';
import { FilterQuery } from '@mikro-orm/core';

export interface VirtualTag {
  name: string;
  description: string;
  color?: TagColorPresets;
  check: (file: File) => boolean;
  set?: (file: File) => void;
  filter: FilterQuery<File>;
}

export const VIRTUAL_TAGS: VirtualTag[] = [
  {
    name: 'unavailable',
    description: 'Whether this file is unavailable.',
    color: TagColorPresets.Red,
    check: (file) => file.metadata.unavailable,
    filter: {
      metadata: {
        unavailable: true,
      },
    },
  },
  {
    name: 'corrupted',
    description: 'Whether this file is corrupted.',
    color: TagColorPresets.Red,
    check: (file) => file.metadata.corrupted,
    filter: {
      metadata: { corrupted: true },
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
    name: 'has_clip',
    description: 'Whether this file has CLIP vectors for search extracted.',
    check: (file) => !!file.media?.vector,
    filter: {
      media: { vector: { $ne: null } },
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
    check: (file) => file.metadata.size > bytes('10MB'),
    filter: {
      metadata: { size: { $gt: bytes('10MB') } },
    },
  },
];

export const VIRTUAL_TAG_NAMES = new Set(VIRTUAL_TAGS.map((tag) => tag.name));
