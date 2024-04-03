import { EntityManager, EntityRepository } from "@mikro-orm/better-sqlite";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { IMAGE_EXTENSIONS } from "../../constants.js";
import { embeddingToBuffer } from "../../helpers/embedding.js";
import { FileEntity } from "../file/entities/file.entity.js";
import { Queue } from "../queue/queue.decorator.js";
import { RehoboamService } from "../rehoboam/rehoboam.service.js";
import { FaceEntity } from "./entities/face.entity.js";
import type { PersonService } from "./person.service.js";
import { PersonEntity } from "./entities/person.entity.js";

@Injectable()
export class PersonTasks {
  @InjectRepository(FaceEntity) private faceRepo: EntityRepository<FaceEntity>;
  @InjectRepository(PersonEntity) private personRepo: EntityRepository<PersonEntity>;

  constructor(
    private rehoboamService: RehoboamService,
    private personService: PersonService,
    private em: EntityManager,
  ) {}

  @Queue("IMAGE_DETECT_FACES", {
    targetConcurrency: 1,
    fileFilter: {
      extension: {
        $in: [...IMAGE_EXTENSIONS],
      },
      info: {
        height: { $ne: null },
        hasFaces: null,
      },
    },
  })
  async detectFaces(file: FileEntity) {
    const faces = await this.rehoboamService.detectFaces(file);
    if (!faces[0]) {
      file.info.hasFaces = false;
      await this.em.persistAndFlush(file);
      return;
    }

    file.info.hasFaces = true;
    for (const face of faces) {
      if (!face.embedding) throw new Error("Face embedding expected");
      const embeddingBuffer = embeddingToBuffer(face.embedding!);

      let person: PersonEntity | number | null = await this.personService.findPersonFromFace(embeddingBuffer);
      if (!person) {
        person = this.personRepo.create({});
      }

      this.faceRepo.create(
        {
          file: file,
          boundingBox: face.bounding_box!,
          embedding: embeddingBuffer,
          person: person,
        },
        { persist: true },
      );
    }

    await this.em.persistAndFlush(file);
  }
}
