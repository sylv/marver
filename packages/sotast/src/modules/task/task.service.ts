import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import type { TaskModel } from './task.model.js';

export interface AdditionalTaskMetadata {
  id: string;
  name: string;
  description?: string;
  running?: boolean;
}

@Injectable()
export class TaskService {
  public static readonly metadata = new Map<string, AdditionalTaskMetadata>();
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  getTasks(): TaskModel[] {
    const intervals = this.schedulerRegistry.getIntervals();
    const cronjobs = this.schedulerRegistry.getCronJobs();
    if (intervals[0]) throw new Error('Intervals as tasks are not implemented yet');
    const tasks: TaskModel[] = [];
    for (const [id, job] of cronjobs) {
      const metadata = TaskService.metadata.get(id);
      if (!metadata) continue;
      tasks.push(this.cronToTask(job, metadata));
    }

    return tasks;
  }

  getTask(id: string): TaskModel | undefined {
    const cronjob = this.schedulerRegistry.getCronJob(id);
    if (!cronjob) return; // todo: support other job types
    const metadata = TaskService.metadata.get(id);
    if (!metadata) return;
    return this.cronToTask(cronjob, metadata);
  }

  runTask(id: string): TaskModel | undefined {
    const cronJob = this.schedulerRegistry.getCronJob(id);
    if (!cronJob) return;
    const metadata = TaskService.metadata.get(id);
    if (!metadata) return;
    cronJob.fireOnTick();
    return this.cronToTask(cronJob, metadata);
  }

  private cronToTask(
    cron: ReturnType<SchedulerRegistry['getCronJob']>,
    metadata: AdditionalTaskMetadata,
  ): TaskModel {
    return {
      ...metadata,
      nextRunAt: cron.nextDate().toMillis(),
    };
  }
}
