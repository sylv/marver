import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { FileEntity } from '../file/entities/file.entity';
import { StorageService } from './storage.service';

@Module({
  providers: [StorageService],
  exports: [StorageService],
  imports: [MikroOrmModule.forFeature([FileEntity])],
})
export class StorageModule {}
