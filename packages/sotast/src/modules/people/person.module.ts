import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { FaceEntity } from './entities/face.entity.js';
import { PersonTasks } from './person.tasks.js';
import { PersonEntity } from '../metadata/entities/person.entity.js';
import { RehoboamModule } from '../rehoboam/rehoboam.module.js';

@Module({
  imports: [MikroOrmModule.forFeature([PersonEntity, FaceEntity]), RehoboamModule],
  providers: [PersonTasks],
})
export class PersonModule {}
