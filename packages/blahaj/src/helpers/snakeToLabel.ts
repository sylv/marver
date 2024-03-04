const KEEP_UPPERCASE = new Set(['CLIP', 'EXIF', 'URL', 'ID']);

/**
 * @example
 * SOME_TITLE_HERE => Some Title Here
 */
export const snakeToLabel = (key: string) => {
  const words = key.split('_');
  return words
    .map((word, i) => {
      if (KEEP_UPPERCASE.has(word.toUpperCase())) return word.toUpperCase();
      if (i === 0) return word[0].toUpperCase() + word.slice(1).toLowerCase();
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};
