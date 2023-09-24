import escapeStringRegexp from 'escape-string-regexp';

export interface Token {
  text: string;
  colour?: string;
  key?: string;
}

const COLOURS = ['bg-fuchsia-700/50', 'bg-violet-700/50', 'bg-blue-700/50', 'bg-cyan-700/50'];

const numberToPattern = (key: string, input: number) => {
  const number = escapeStringRegexp(input.toString());
  return `(?<= |_|\.|\\b|^|/)(?<${key}>(0?)+${number}\\b)`;
};

const stringToPattern = (key: string, input: string) => {
  // todo: input should have ? replaced witn (?|_) etc, the LLM will sometimes
  // infer characters that were stripped for the file path.
  const string = escapeStringRegexp(input).replaceAll(' ', '.+?');
  return `(?<=\\b|\\.|_|^|/)(?<${key}>${string})(?=/|\\b|\\.|_| |$)`;
};

const valueToPattern = (key: string, input: unknown) => {
  if (typeof input === 'number') return numberToPattern(key, input);
  if (typeof input === 'string') return stringToPattern(key, input);
};

const KEY_COLOURS = new Map<string, string>();
const getKeyColour = (key: string) => {
  if (KEY_COLOURS.has(key)) return KEY_COLOURS.get(key);
  const colour = COLOURS[KEY_COLOURS.size % COLOURS.length];
  KEY_COLOURS.set(key, colour);
  return colour;
};

export function* tokenizeStringFromObject(
  input: string,
  object: Record<string, any>,
): Generator<Token> {
  const keys = Object.keys(object).sort();
  let patternParts = [];
  for (const key of keys) {
    const value = object[key];
    if (Array.isArray(value)) {
      for (const [index, item] of value.entries()) {
        const pattern = valueToPattern(`${key}_${index}`, item);
        if (pattern) {
          patternParts.push(pattern);
        }
      }
    } else {
      const pattern = valueToPattern(key, value);
      if (pattern) {
        patternParts.push(pattern);
      }
    }
  }

  const pattern = new RegExp(`(${patternParts.join('|')})`, 'giu');
  let lastIndex = 0;
  for (const match of input.matchAll(pattern)) {
    const before = input.slice(lastIndex, match.index);
    if (before) {
      yield { text: before };
    }

    for (const [key, value] of Object.entries(match.groups!)) {
      const colour = getKeyColour(key.replace(/_\d+$/, ''));
      yield { text: value, colour, key };
    }

    lastIndex = match.index! + match[0].length;
  }

  const after = input.slice(lastIndex);
  if (after) {
    yield { text: after };
  }
}
