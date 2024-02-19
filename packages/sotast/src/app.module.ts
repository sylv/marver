import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpException, Logger, Module } from '@nestjs/common';
import { FileModule } from './modules/file/file.module.js';
import ORM_CONFIG from './orm.config.js';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, type MercuriusDriverConfig } from '@nestjs/mercurius';
import { ImageModule } from './modules/image/image.module.js';
import { QueueModule } from './modules/queue/queue.module.js';
import { VideoModule } from './modules/video/video.module.js';
import { FfmpegModule } from './modules/ffmpeg/ffmpeg.module.js';
import { PersonModule } from './modules/people/person.module.js';
import { config } from './config.js';
import { TaskModule } from './modules/task/task.module.js';
import { RehoboamModule } from './modules/rehoboam/rehoboam.module.js';

const GQL_LOGGER = new Logger('GraphQL');

@Module({
  imports: [
    MikroOrmModule.forRoot(ORM_CONFIG),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      jit: config.is_production ? 5 : 1,
      sortSchema: true,
      autoSchemaFile: config.is_production ? true : 'schema.gql',
      fieldResolverEnhancers: ['interceptors', 'guards', 'filters'],
      errorFormatter: (execution) => {
        for (const error of execution.errors!) {
          GQL_LOGGER.warn(error, error.stack);
        }

        const [error] = execution.errors!;
        const originalError = error?.originalError;
        if (originalError instanceof HttpException) {
          return {
            statusCode: originalError.getStatus(),
            response: { data: originalError.getResponse() as any },
          };
        }

        return { statusCode: 500, response: execution };
      },
    }),
    ScheduleModule.forRoot(),
    FileModule,
    PersonModule,
    ImageModule,
    QueueModule,
    VideoModule,
    FfmpegModule,
    RehoboamModule,
    TaskModule,
  ],
})
export class AppModule {}
