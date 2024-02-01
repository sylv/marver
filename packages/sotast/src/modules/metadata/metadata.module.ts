import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { MetadataEntity } from './entities/metadata.entity.js';
import { PersonEntity } from './entities/person.entity.js';
import { SourceEntity } from './entities/source.entity.js';
import { MetadataTasks } from './metadata.tasks.js';
import { FileEntity } from '../file/entities/file.entity.js';

@Module({
  imports: [MikroOrmModule.forFeature([FileEntity, MetadataEntity, PersonEntity, SourceEntity])],
  providers: [MetadataTasks],
})
export class MetadataModule {}
