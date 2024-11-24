import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module, forwardRef } from "@nestjs/common";
import bytes from "bytes";
import { CacheModule } from "../cache/cache.module.js";
import { CLIPModule } from "../clip/clip.module.js";
import { FileEmbeddingEntity } from "../file/entities/file-embedding.entity.js";
import { FileExifDataEntity } from "../file/entities/file-exif.entity.js";
import { FileInfoEmbeddable } from "../file/entities/file-info.entity.js";
import { FileEntity } from "../file/entities/file.entity.js";
import { FileModule } from "../file/file.module.js";
import { StorageModule } from "../storage/storage.module.js";
import { ImageController } from "./image.controller.js";
import { ImageService } from "./image.service.js";

@Module({
  imports: [
    MikroOrmModule.forFeature([FileEntity, FileInfoEmbeddable, FileExifDataEntity, FileEmbeddingEntity]),
    CLIPModule,
    StorageModule,
    CacheModule.forCache({
      name: "processed_images",
      maxSize: bytes.parse("1gb"),
      maxItems: 5000,
    }),
    forwardRef(() => FileModule),
  ],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
