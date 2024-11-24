import { NestFactory } from "@nestjs/core";
import { TasksModule } from "./tasks.module";
import { MikroORM } from "@mikro-orm/libsql";
import { type MikroORM as BetterMikroORM } from "@mikro-orm/libsql";
import { configureOrm } from "./migrate";

const app = await NestFactory.createApplicationContext(TasksModule);

const orm = app.get(MikroORM) as BetterMikroORM;
await configureOrm(orm);
