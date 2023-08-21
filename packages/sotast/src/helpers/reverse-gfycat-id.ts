import { randomInt } from 'crypto';
import adjectives from '../data/gfycat/adjectives.json';
import animals from '../data/gfycat/animals.json';

adjectives.sort((a, b) => b.length - a.length);
animals.sort((a, b) => b.length - a.length);

/** Get the next word in the given id */
const getWord = (idSlice: string, list: string[]): string | undefined => {
  for (const word of list) {
    if (idSlice.startsWith(word)) {
      return word;
    }
  }
};

/**
 * Camel case a lowercase gfycat IDs. For example:
 * - "crowdedsaltybordercollie" > "CrowdedSaltyBordercollie"
 * - "thirstyindelibleamethystinepython" > "ThirstyIndelibleAmethystinepython"
 */
export const reverseGfycatId = (id: string): string[] | undefined => {
  id = id.toLocaleLowerCase();

  // the format of ids are always adjective + adjective + animal
  const parts = [];
  let idSlice = id;

  while (idSlice.length > 0) {
    const list = parts.length === 2 ? animals : adjectives;
    const word = getWord(idSlice, list);
    if (!word) {
      return undefined;
    }

    parts.push(word);
    if (parts[3]) return undefined;
    idSlice = idSlice.slice(word.length);
  }

  if (parts.length !== 3) return undefined;
  return parts;
};

export const generateGfycatId = (length: number): string => {
  const parts = [];
  while (parts.length < length) {
    const list: string[] = parts.length === 2 ? animals : adjectives;
    const word = list[randomInt(list.length)];
    parts.push(word);
  }

  return parts.join('');
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('should reverse gfycat ids', () => {
    expect(reverseGfycatId('crowdedsaltybordercollie')).toEqual(['crowded', 'salty', 'bordercollie']);
    expect(reverseGfycatId('thirstyindelibleamethystinepython')).toEqual([
      'thirsty',
      'indelible',
      'amethystinepython',
    ]);
    expect(reverseGfycatId('fatherlyidenticalimperatorangel')).toEqual([
      'fatherly',
      'identical',
      'imperatorangel',
    ]);
    expect(reverseGfycatId('anxiousnegativebushbaby')).toEqual(['anxious', 'negative', 'bushbaby']);
    expect(reverseGfycatId('Illiteratetallirrawaddydolphin')).toEqual([
      'illiterate',
      'tall',
      'irrawaddydolphin',
    ]);
  });
}
