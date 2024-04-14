import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { FaceEntity } from "./entities/face.entity.js";
import { PersonTasks } from "./person.tasks.js";
import { PersonEntity } from "./entities/person.entity.js";
import { RehoboamModule } from "../rehoboam/rehoboam.module.js";
import { PersonService } from "./person.service.js";
import { FaceService } from "./face.service.js";
import { DownloadModule } from "../download/download.module.js";

@Module({
  imports: [MikroOrmModule.forFeature([PersonEntity, FaceEntity]), RehoboamModule, DownloadModule],
  providers: [PersonTasks, PersonService, FaceService],
})
export class PersonModule {}
