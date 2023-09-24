import escapeStringRegexp from 'escape-string-regexp';

export function* matchAll(input: string, pattern: RegExp) {
  if (!pattern.global) throw new Error('matchAll requires a global RegExp');
  pattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input)) !== null) {
    yield match;
  }
}

export function matchAny(patterns: (RegExp | string)[]) {
  const strings = patterns.filter((el) => typeof el === 'string') as string[];
  const regexs = patterns.filter((el) => el instanceof RegExp) as RegExp[];

  if (strings) {
    const escaped = strings.map((el) => escapeStringRegexp(el)).join('|');
    const regex = new RegExp(escaped, 'g');
    regexs.push(regex);
  }

  return (input: string) => {
    for (const pattern of regexs) {
      if (pattern.test(input)) return true;
    }

    return false;
  };
}
