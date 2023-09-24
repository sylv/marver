import { stripSourceDirFromPath } from './strip-path.js';

export const normalizePath = (input: string) => {
  return stripSourceDirFromPath(
    input
      // strip windows drive letters
      .replace(/^[A-Z]:/, '')
      // replace \ with /
      .replace(/\\/g, '/')
      // remove trailing /
      .replace(/\/$/, ''),
  );
};
