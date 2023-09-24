import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { FileEntity } from '../file/entities/file.entity.js';
import { TaskService } from './task.service.js';
import { TaskEntity } from './task.entity.js';

@Module({
  imports: [MikroOrmModule.forFeature([FileEntity, TaskEntity]), DiscoveryModule],
  providers: [TaskService],
})
export class TaskModule {}
