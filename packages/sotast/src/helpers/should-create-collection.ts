const IGNORE_NAMES = new Set([
  'photos',
  'videos',
  'images',
  'pictures',
  'downloads',
  'documents',
  'music',
  'audio',
  'sounds',
  'projects',
  'work',
  'misc',
  'miscellaneous',
  'stuff',
  'unsorted',
  'unorganized',
  'youtube',
  'gallery-dl',
  'youtube-dl',
  'yt-dlp',
  'torrents',
  'torrent',
  'completed',
  'incomplete',
]);

export const shouldCreateCollection = (dirName: string) => {
  const name = dirName.toLowerCase();
  return !IGNORE_NAMES.has(name);
};
