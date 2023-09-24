import { config } from '../config.js';

config.source_dirs.sort((a, b) => b.length - a.length);

/**
 * Strip source dirs from a path.
 * @example
 * Given the source dir "/mnt/pool" and a path "/mnt/pool/foo/bar/baz.jpg",
 * this would return "/foo/bar/baz.jpg".
 */
export const stripSourceDirFromPath = (input: string) => {
  const sourceDir = config.source_dirs.find((dir) => input.startsWith(dir));
  if (!sourceDir) return input;
  return input.slice(sourceDir.length + 1);
};
