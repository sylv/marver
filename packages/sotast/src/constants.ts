export const SUBTITLE_EXTENSIONS = new Set(['sub', 'srt']);
export const METADATA_EXTENSIONS = new Set(['json', 'xml']);
export const SUPPORTING_EXTENSIONS = new Set([...SUBTITLE_EXTENSIONS, ...METADATA_EXTENSIONS]);

export const VIDEO_EXTENSIONS = new Set(['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mpg', 'mpeg', 'm4v']);
export const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'jfif', 'tiff', 'tif', 'bmp']);
export const FILE_EXTENSIONS = new Set([...VIDEO_EXTENSIONS, ...IMAGE_EXTENSIONS]);
