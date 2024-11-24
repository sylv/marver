import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import ORM_CONFIG from "./orm.config.js";
import { VideoQueues } from "./tasks/video.queues.js";
import { ImageTasks } from "./tasks/image.tasks.js";
import { SubtitleTasks } from "./tasks/subtitle.tasks.js";
import { QueueModule } from "./modules/queue/queue.module.js";
import { ImageModule } from "./modules/image/image.module.js";
import { VideoModule } from "./modules/video/video.module.js";
import { SubtitlesModule } from "./modules/subtitles/subtitles.module.js";
import { CLIPModule } from "./modules/clip/clip.module.js";
import { FileAssetEntity } from "./modules/file/entities/file-asset.entity.js";
import { FileEmbeddingEntity } from "./modules/file/entities/file-embedding.entity.js";

@Module({
  providers: [ImageTasks, VideoQueues, SubtitleTasks],
  imports: [
    MikroOrmModule.forRoot(ORM_CONFIG),
    MikroOrmModule.forFeature([FileAssetEntity, FileEmbeddingEntity]),
    QueueModule,
    ImageModule,
    VideoModule,
    SubtitlesModule,
    CLIPModule,
  ],
})
export class TasksModule {}
