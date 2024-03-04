import { Module, type DynamicModule } from '@nestjs/common';
import { CACHE_OPTIONS_KEY, type CacheOptions } from './cache-options.interface';
import { CacheService } from './cache.service';

@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {
  static forCache(options: CacheOptions): DynamicModule {
    return {
      module: CacheModule,
      providers: [
        {
          provide: CACHE_OPTIONS_KEY,
          useValue: options,
        },
      ],
    };
  }
}
