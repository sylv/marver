import { defineConfig } from '@mikro-orm/sqlite';
import { LoadStrategy } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';

export const MIKRO_ORM_TEST_CONFIG = defineConfig({
  dbName: ':memory:',
  debug: true,
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  loadStrategy: LoadStrategy.JOINED,
  findOneOrFailHandler: () => {
    throw new NotFoundException();
  },
});
