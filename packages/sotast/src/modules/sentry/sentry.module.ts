import { Module } from '@nestjs/common';
import { SentryService } from './sentry.service.js';

@Module({
  providers: [SentryService],
  exports: [SentryService],
})
export class SentryModule {}
