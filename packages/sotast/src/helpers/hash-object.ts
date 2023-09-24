import { Hash, createHash } from 'crypto';

export const hashObject = (object: unknown) => {
  const hash = createHash('sha256');
  addToHash(hash, object);
  return hash;
};

const addToHash = (hash: Hash, value: unknown) => {
  if (Array.isArray(value)) {
    value.sort();
    for (const item of value) {
      addToHash(hash, item);
    }
  } else if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value).sort();
    for (const key of keys) {
      hash.update(key);
      addToHash(hash, (value as Record<string, unknown>)[key]);
    }
  } else {
    hash.update(String(value));
  }
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('should hash objects', () => {
    expect(hashObject({ a: 1, b: 2 }).digest('hex')).toMatchInlineSnapshot(
      '"85337816d263d362acb23a4255a636191075c2a90c47f2ee6db3362f7df11203"',
    );
  });

  it('should sort keys and arrays before hashing', () => {
    expect(hashObject({ b: 2, a: 1 }).digest('hex')).toBe(hashObject({ a: 1, b: 2 }).digest('hex'));
    expect(hashObject([2, 1]).digest('hex')).toBe(hashObject([1, 2]).digest('hex'));
  });

  it('should hash nested objects', () => {
    const one = hashObject({ a: 1, b: 2 }).digest('hex');
    const two = hashObject({ a: 1, b: { c: 3, d: 4 } }).digest('hex');
    expect(two).toMatchInlineSnapshot(
      '"d828a8beb9306d318dada837a9b37fb84295b218491987b46ad431422940d939"',
    );
    expect(two).not.toMatch(one);
  });
}
