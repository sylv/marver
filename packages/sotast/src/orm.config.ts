import { defineConfig } from '@mikro-orm/better-sqlite';
import { Logger, NotFoundException } from '@nestjs/common';
import type { Database } from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { UnderscoreNamingStrategy } from '@mikro-orm/core';

export const ORM_LOGGER = new Logger('MikroORM');
export const MIGRATIONS_TABLE_NAME = 'mikro_orm_migrations';

class CustomNamingStrategy extends UnderscoreNamingStrategy {
  classToTableName(entityName: string): string {
    const result = super.classToTableName(entityName);
    return result.replace(/_entity/g, '');
  }
}

export default defineConfig({
  dbName: join(config.metadata_dir, 'mesa.db'),
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  persistOnCreate: false,
  namingStrategy: CustomNamingStrategy,
  debug: config.orm_debug,
  migrations: {
    path: join(dirname(fileURLToPath(import.meta.url)), 'migrations'),
    tableName: MIGRATIONS_TABLE_NAME,
  },
  pool: {
    afterCreate: (...args) => {
      // ensure squtil extension is loaded on each connection
      const [conn, done] = args as [Database, () => void];

      const dirname = fileURLToPath(new URL('.', import.meta.url));
      const path = join(dirname, '../../../target/release/libsqutil.so');
      conn.loadExtension(path);

      done();
    },
  },
  logger: (message) => ORM_LOGGER.debug(message),
  findOneOrFailHandler: () => {
    throw new NotFoundException();
  },
});
