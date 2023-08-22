import { Module } from '@nestjs/common';
import { SolomonService } from './solomon.service.js';

@Module({
  providers: [SolomonService],
  exports: [SolomonService],
})
export class SolomonModule {}
