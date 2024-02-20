import schema from '#root/@generated/schema.json';
import type { CacheExchangeOpts } from '@urql/exchange-graphcache';

export const cacheOptions: Partial<CacheExchangeOpts> = {
  schema: schema,
  keys: {
    FileInfo: () => null,
  },
};
