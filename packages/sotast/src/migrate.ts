import { MikroORM } from "@mikro-orm/libsql";
import type { Options } from "@mikro-orm/core";
import mikroOrmConfig, { ORM_LOGGER } from "./orm.config.js";

export const migrate = async (config: Options = mikroOrmConfig) => {
  ORM_LOGGER.debug("Checking for and running migrations");

  const orm = (await MikroORM.init(config)) as MikroORM;
  await configureOrm(orm);

  const migrator = orm.getMigrator();
  const executedMigrations = await migrator.getExecutedMigrations();
  const pendingMigrations = await migrator.getPendingMigrations();
  if (!pendingMigrations[0]) {
    ORM_LOGGER.debug(`No pending migrations, ${executedMigrations.length} already executed`);
    return;
  }

  ORM_LOGGER.log(`Migrating through ${pendingMigrations.length} migrations`);
  await migrator.up();
  await orm.close();
  ORM_LOGGER.debug("Migrations check complete");
};

export const configureOrm = async (orm: MikroORM) => {
  await orm.em.execute("PRAGMA busy_timeout = 5000");
  await orm.em.execute("PRAGMA journal_mode = WAL");
  await orm.em.execute("PRAGMA synchronous = NORMAL");
};
