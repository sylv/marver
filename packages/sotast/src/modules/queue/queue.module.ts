import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { FileEntity } from '../file/entities/file.entity.js';
import { QueueService } from './queue.service.js';
import { JobStateEntity } from './job-state.entity.js';

@Module({
  imports: [MikroOrmModule.forFeature([FileEntity, JobStateEntity]), DiscoveryModule],
  providers: [QueueService],
})
export class QueueModule {}
