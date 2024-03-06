import type { CacheExchangeOpts } from '@urql/exchange-graphcache';
import { retryExchange as retry } from '@urql/exchange-retry';

export const cacheOptions: Partial<CacheExchangeOpts> = {
  keys: {
    FileInfo: () => null,
    JobState: () => null,
    FileExifData: () => null,
  },
};

export const retryExchange = retry({
  initialDelayMs: 1000,
  maxDelayMs: 15000,
  randomDelay: true,
  maxNumberAttempts: 2,
});
