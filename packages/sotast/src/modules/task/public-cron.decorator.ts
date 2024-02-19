import { Cron, type CronExpression } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { TaskService, type AdditionalTaskMetadata } from './task.service.js';

/**
 * Register a cron task that will be visible in the UI and can be triggered manually.
 * @warning If "@CreateRequestContext" is used before "@PublicCron", the cron job will not be registered.
 * Why? Who the fuck knows! But it took me an hour to find out so I'm having the time of my life right now.
 */
export const PublicCron = (
  expression: CronExpression | string,
  options: Omit<AdditionalTaskMetadata, 'running' | 'id'>,
): MethodDecorator => {
  const id = randomUUID();
  const metadata: AdditionalTaskMetadata = {
    ...options,
    id: id,
    running: false,
  };

  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const originalValue = descriptor.value;
    descriptor.value = function (...args: any[]) {
      if (metadata.running) return;
      const result = originalValue.apply(this, args);
      if ('finally' in result) {
        metadata.running = true;
        result.finally(() => {
          metadata.running = false;
        });
      }

      return result;
    };

    TaskService.metadata.set(id, metadata);
    return Cron(expression, { name: id })(target, propertyKey, descriptor);
  };
};
