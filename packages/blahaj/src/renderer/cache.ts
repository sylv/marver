import type { CacheExchangeOpts } from "@urql/exchange-graphcache";

export const cacheOptions: Partial<CacheExchangeOpts> = {
  keys: {
    FileInfo: () => null,
    JobState: () => null,
    FileExifData: () => null,
  },
};
