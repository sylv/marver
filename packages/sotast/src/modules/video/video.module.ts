import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { CLIPModule } from "../clip/clip.module.js";
import { FfmpegModule } from "../ffmpeg/ffmpeg.module.js";
import { FileInfoEmbeddable } from "../file/entities/file-info.entity.js";
import { FileEntity } from "../file/entities/file.entity.js";
import { ImageModule } from "../image/image.module.js";
import { VideoController } from "./video.controller.js";
import { VideoQueues } from "./video.queues.js";
import { FileEmbeddingEntity } from "../file/entities/file-embedding.entity.js";
import { FileAssetEntity } from "../file/entities/file-asset.entity.js";

@Module({
  providers: [VideoQueues],
  controllers: [VideoController],
  imports: [
    FfmpegModule,
    CLIPModule,
    ImageModule,
    MikroOrmModule.forFeature([FileEntity, FileAssetEntity, FileInfoEmbeddable, FileEmbeddingEntity]),
  ],
})
export class VideoModule {}
