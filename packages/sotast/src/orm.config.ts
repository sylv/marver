import { defineConfig } from '@mikro-orm/sqlite';
import { UnderscoreNamingStrategy } from '@mikro-orm/core';
import { Logger, NotFoundException } from '@nestjs/common';
import type { Database } from 'bun:sqlite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

export const ORM_LOGGER = new Logger('MikroORM');
export const MIGRATIONS_TABLE_NAME = 'mikro_orm_migrations';

class CustomNamingStrategy extends UnderscoreNamingStrategy {
  classToTableName(entityName: string): string {
    const result = super.classToTableName(entityName);
    return result.replace(/_entity/g, '');
  }
}

const IS_TS = import.meta.url.endsWith('.ts');
const TS_ENTITIES = ['src/**/*.entity.ts'];
const JS_ENTITIES = ['dist/**/*.entity.js'];

export default defineConfig({
  dbName: join(config.metadata_dir, 'mesa.db'),
  entities: IS_TS ? TS_ENTITIES : JS_ENTITIES,
  entitiesTs: TS_ENTITIES,
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
