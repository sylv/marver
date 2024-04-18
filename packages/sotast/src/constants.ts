import { getPackageMetadata } from "./helpers/getPackageMetadata";

export const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "jfif",
  "tiff",
  "tif",
  "bmp",
  "heif",
]);

export const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "mkv",
  "avi",
  "mov",
  "wmv",
  "flv",
  "webm",
  "mpg",
  "mpeg",
  "m4v",
]);

export const SUPPORTED_EXTENSIONS = new Set([...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS]);

// works around swc+esbuild macro limitation
export const SERVER_INFO = await getPackageMetadata();
