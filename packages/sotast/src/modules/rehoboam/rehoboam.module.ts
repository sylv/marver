import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CompletionEntity } from './entities/completion.entity.js';
import { LlamaCppService } from './integrations/llama-cpp.service.js';
import { RehoboamResolver } from './rehoboam.resolver.js';
import { RehoboamService } from './rehoboam.service.js';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { CompletionExampleEntity } from './entities/completion-example.entity.js';

@Module({
  providers: [RehoboamService, RehoboamResolver, LlamaCppService],
  imports: [
    MikroOrmModule.forFeature([CompletionEntity, CompletionExampleEntity]),
    DiscoveryModule,
  ],
  exports: [RehoboamService],
})
export class RehoboamModule {}
