import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskResolver } from './task.resolver.js';
import { TaskService } from './task.service.js';

@Module({
  providers: [TaskService, TaskResolver],
  imports: [ScheduleModule],
})
export class TaskModule {}
