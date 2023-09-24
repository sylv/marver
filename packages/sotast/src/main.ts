import { MetadataStorage, MikroORM } from '@mikro-orm/core';
import { type MikroORM as BetterMikroORM } from '@mikro-orm/sqlite';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { fastify } from 'fastify';
import ms from 'ms';
import { performance } from 'perf_hooks';
import { AppModule } from './app.module.js';
import { config } from './config.js';
import { MikroOrmSerializerInterceptor } from './serializer.interceptor.js';

// todo: bun doesn't emit decorator metadata for enums, but typescript does.
// this fixes the metadata by inferring the type from the enum values, which
// mikroorm expects.
const metadata = MetadataStorage.getMetadata();
for (const item of Object.values(metadata)) {
  for (const prop of Object.values(item.properties)) {
    if (prop.enum && !prop.type) {
      const items = (prop.items as any as () => Record<string, string | number>)();
      const hasNumberItems = Object.values(items).some((value) => typeof value === 'number');
      prop.type = hasNumberItems ? 'number' : 'string';
    }
  }
}

const start = performance.now();
const startupTimer = setTimeout(() => {
  const logger = new Logger('Watchdog');
  const duration = ms(config.startup_timeout, { long: true });
  logger.error(
    `Application did not complete startup within the ${duration} grace period. This is likely a bootstrap hook that never resolves, or a service not connecting. Shutting down...`,
  );

  process.exit(1);
}, config.startup_timeout);

const logger = new Logger('bootstrap');
const server = fastify({
  trustProxy: process.env.TRUST_PROXY === 'true',
  maxParamLength: 1024,
});

const adapter = new FastifyAdapter(server as any);
const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);

app.useGlobalInterceptors(new MikroOrmSerializerInterceptor());
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

// temporary during development, auto update db schema
// this is done before calling listen() so app hooks can run
// on a fully initialized database
const orm = app.get(MikroORM) as BetterMikroORM;
await orm.getSchemaGenerator().updateSchema();

await app.listen(8080, '0.0.0.0', (error, address) => {
  if (error) throw error;
  const end = performance.now();
  const duration = ms(end - start, { long: true });
  logger.debug(`Startup completed in ${duration}`);
  logger.log(`Listening at ${address}`);
  clearTimeout(startupTimer);
});
