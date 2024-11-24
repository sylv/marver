import { defineConfig } from "@mikro-orm/libsql";
import { Migrator } from "@mikro-orm/migrations";
import { Logger, NotFoundException } from "@nestjs/common";
import type { Database } from "libsql";
import { join } from "path";
import { config } from "./config.js";

export const ORM_LOGGER = new Logger("MikroORM");

export default defineConfig({
  dbName: join(config.metadata_dir, "core.db"),
  extensions: [Migrator],
  persistOnCreate: true,
  debug: config.orm_debug,
  baseDir: import.meta.dirname,
  entities: ["**/*.entity.{js,ts}"],
  migrations: {
    path: "migrations",
    tableName: "migrations",
    transactional: true,
  },
  pool: {
    afterCreate: (conn: Database, done: () => void) => {
      const path = join(import.meta.dirname, "../../../target/release/libvss.so");
      conn.loadExtension(path);
      done();
    },
  },
  logger: (message) => ORM_LOGGER.debug(message),
  findOneOrFailHandler: () => {
    throw new NotFoundException();
  },
});
