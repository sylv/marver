export const CACHE_OPTIONS_KEY = Symbol('CacheOptions');

export interface CacheOptions {
  expireAfter: number;
  maxItems: number;
  maxSize: number;
  name: string;
}
