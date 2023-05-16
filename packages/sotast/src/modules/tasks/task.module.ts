import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { File } from '../file/entities/file.entity.js';
import { TaskService } from './task.service.js';
import { Task } from './task.entity.js';

@Module({
  imports: [MikroOrmModule.forFeature([File, Task]), DiscoveryModule],
  providers: [TaskService],
})
export class TaskModule {}
