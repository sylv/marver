import { defineConfig } from '@mikro-orm/better-sqlite';
import { Logger, NotFoundException } from '@nestjs/common';
import type { Database } from 'better-sqlite3';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const ORM_LOGGER = new Logger('MikroORM');
const MIGRATIONS_TABLE_NAME = 'mikro_orm_migrations';
const IS_TS = import.meta.url.endsWith('.ts');

export default defineConfig({
  dbName: join(config.metadata_dir, 'core.db'),
  entities: IS_TS ? ['src/**/*.entity.ts'] : ['dist/**/*.entity.{ts,js}'],
  persistOnCreate: true,
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
