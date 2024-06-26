import { join } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "@mikro-orm/better-sqlite";
import { Migrator } from "@mikro-orm/migrations";
import { Logger, NotFoundException } from "@nestjs/common";
import type { Database } from "better-sqlite3";
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
    afterCreate: (...args) => {
      // ensure sqlite-cosim extension is loaded on each connection
      const [conn, done] = args as [Database, () => void];
      const dirname = fileURLToPath(new URL(".", import.meta.url));
      const path = join(dirname, "../../../target/release/libsqlite_cosim.so");
      conn.loadExtension(path);

      done();
    },
  },
  logger: (message) => ORM_LOGGER.debug(message),
  findOneOrFailHandler: () => {
    throw new NotFoundException();
  },
});
