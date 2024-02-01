import { Module } from '@nestjs/common';
import { RehoboamService } from './rehoboam.service.js';

@Module({
  providers: [RehoboamService],
  exports: [RehoboamService],
})
export class RehoboamModule {}
