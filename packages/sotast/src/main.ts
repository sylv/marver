import { type MikroORM as BetterMikroORM } from '@mikro-orm/better-sqlite';
import { MikroORM } from '@mikro-orm/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { fastify } from 'fastify';
import { AppModule } from './app.module.js';
import { MikroOrmSerializerInterceptor } from './serializer.interceptor.js';
import { SolomonService } from './modules/solomon/solomon.service.js';
import { FileScanService } from './modules/file/file-scan.service.js';

// Error.stackTraceLimit = 100;

const logger = new Logger('bootstrap');
const server = fastify({
  trustProxy: process.env.TRUST_PROXY === 'true',
  maxParamLength: 1024,
});

const adapter = new FastifyAdapter(server);
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
const orm = app.get(MikroORM) as BetterMikroORM;
await orm.getSchemaGenerator().updateSchema();

await app.listen(8080, '0.0.0.0', (error, address) => {
  if (error) throw error;
  logger.log(`Listening at ${address}`);
});

const scanService = app.get(FileScanService);
await scanService.scan();
