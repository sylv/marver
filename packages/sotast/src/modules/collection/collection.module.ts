import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CollectionEntity } from './collection.entity';
import { CollectionResolver } from './collection.resolver';
import { FileEntity } from '../file/entities/file.entity';

@Module({
  providers: [CollectionResolver],
  imports: [MikroOrmModule.forFeature([CollectionEntity, FileEntity])],
})
export class CollectionModule {}
