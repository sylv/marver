import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Face } from './entities/face.entity.js';
import { Person } from './entities/person.entity.js';
import { PersonTasks } from './person.tasks.js';
import { SentryModule } from '../sentry/sentry.module.js';

@Module({
  imports: [MikroOrmModule.forFeature([Person, Face]), SentryModule],
  providers: [PersonTasks],
})
export class PersonModule {}