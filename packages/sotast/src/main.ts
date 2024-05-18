import { type MikroORM as BetterMikroORM } from "@mikro-orm/better-sqlite";
import { MikroORM } from "@mikro-orm/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { fastify } from "fastify";
import ms from "ms";
import { performance } from "perf_hooks";
import { AppModule } from "./app.module.js";
import { config } from "./config.js";
import { configureOrm, migrate } from "./migrate.js";

const start = performance.now();
const startupTimer = setTimeout(() => {
  const logger = new Logger("Watchdog");
  const duration = ms(config.startup_timeout, { long: true });
  logger.error(
    `Application did not complete startup within the ${duration} grace period. This is likely a bootstrap hook that never resolves, or a service not connecting. Shutting down...`,
  );

  process.exit(1);
}, config.startup_timeout);

await migrate();

const logger = new Logger("bootstrap");
const server = fastify({
  trustProxy: process.env.TRUST_PROXY === "true",
  maxParamLength: 1024,
});

const adapter = new FastifyAdapter(server as any);
const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);

app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);

const orm = app.get(MikroORM) as BetterMikroORM;
await configureOrm(orm);

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "127.0.0.1";

await app.listen(PORT, HOST, (error, address) => {
  if (error) throw error;
  const end = performance.now();
  const duration = ms(end - start, { long: true });
  logger.debug(`Started in ${duration}`);
  logger.log(`Listening at ${address}`);
  clearTimeout(startupTimer);
});
