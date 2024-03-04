const CAPITALISE = new Set(['iso', 'exif']);

/**
 * @example
 * someTitleHere => Some Title Here
 */
export const pascalToLabel = (key: string) => {
  const words = key.replace(/datetime/i, 'Time').split(/(?=[A-Z])/);
  return words
    .map((word) => {
      if (CAPITALISE.has(word.toLowerCase())) return word.toUpperCase();
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};
