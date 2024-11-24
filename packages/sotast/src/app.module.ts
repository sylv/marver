import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Logger, Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { MercuriusDriver, type MercuriusDriverConfig } from "@nestjs/mercurius";
import { ScheduleModule } from "@nestjs/schedule";
import { mercurius } from "mercurius";
import { AppResolver } from "./app.resolver.js";
import { config } from "./config.js";
import { CLIPModule } from "./modules/clip/clip.module.js";
import { FfmpegModule } from "./modules/ffmpeg/ffmpeg.module.js";
import { FileModule } from "./modules/file/file.module.js";
import { ImageModule } from "./modules/image/image.module.js";
import { SubtitlesModule } from "./modules/subtitles/subtitles.module.js";
import { TaskModule } from "./modules/task/task.module.js";
import { VideoModule } from "./modules/video/video.module.js";
import ORM_CONFIG from "./orm.config.js";
import { AppService } from "./app.service.js";

const GQL_LOGGER = new Logger("GraphQL");

@Module({
  providers: [AppResolver, AppService],
  imports: [
    MikroOrmModule.forRoot(ORM_CONFIG),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      jit: config.is_production ? 5 : 1,
      sortSchema: true,
      autoSchemaFile: config.is_production ? true : "schema.gql",
      fieldResolverEnhancers: ["interceptors", "guards", "filters"],
      errorFormatter: (result, ctx) => {
        for (const error of result.errors!) {
          GQL_LOGGER.warn(error, error.stack);
        }

        const def = mercurius.defaultErrorFormatter(result, ctx);
        return {
          statusCode: def.statusCode || 500,
          response: def.response,
        };
      },
    }),
    ScheduleModule.forRoot(),
    FileModule,
    ImageModule,
    VideoModule,
    FfmpegModule,
    SubtitlesModule,
    CLIPModule,
    TaskModule,
  ],
})
export class AppModule {}
