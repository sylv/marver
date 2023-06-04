import { defineConfig } from '@mikro-orm/better-sqlite';
import { Logger, NotFoundException } from '@nestjs/common';
import type { Database } from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

export const ORM_LOGGER = new Logger('MikroORM');
export const MIGRATIONS_TABLE_NAME = 'mikro_orm_migrations';

export default defineConfig({
  dbName: join(config.metadata_dir, 'mesa.db'),
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  persistOnCreate: false,
  debug: true,
  migrations: {
    path: join(dirname(fileURLToPath(import.meta.url)), 'migrations'),
    tableName: MIGRATIONS_TABLE_NAME,
  },
  pool: {
    afterCreate: (...args) => {
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
