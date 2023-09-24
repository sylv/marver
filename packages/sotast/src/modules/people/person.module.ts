import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { FaceEntity } from './entities/face.entity.js';
import { PersonTasks } from './person.tasks.js';
import { SolomonModule } from '../solomon/solomon.module.js';
import { PersonEntity } from '../metadata/entities/person.entity.js';

@Module({
  imports: [MikroOrmModule.forFeature([PersonEntity, FaceEntity]), SolomonModule],
  providers: [PersonTasks],
})
export class PersonModule {}
