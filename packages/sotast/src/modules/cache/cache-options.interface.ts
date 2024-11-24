export const CACHE_OPTIONS_KEY = Symbol("CacheOptions");

export interface CacheOptions {
  maxItems: number;
  maxSize: number;
  name: string;
}
