import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Face } from './entities/face.entity.js';
import { Person } from './entities/person.entity.js';
import { PersonTasks } from './person.tasks.js';
import { SolomonModule } from '../solomon/solomon.module.js';

@Module({
  imports: [MikroOrmModule.forFeature([Person, Face]), SolomonModule],
  providers: [PersonTasks],
})
export class PersonModule {}
