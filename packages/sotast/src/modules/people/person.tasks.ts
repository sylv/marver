import { EntityManager, EntityRepository } from "@mikro-orm/better-sqlite";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, Logger } from "@nestjs/common";
import { IMAGE_EXTENSIONS } from "../../constants.js";
import { embeddingToBuffer } from "../../helpers/embedding.js";
import { FileEntity } from "../file/entities/file.entity.js";
import { Queue } from "../queue/queue.decorator.js";
import { FaceEntity } from "./entities/face.entity.js";
import { PersonEntity } from "./entities/person.entity.js";
import { FaceService } from "./face.service.js";
import { PersonService } from "./person.service.js";
import { randomBytes } from "node:crypto";

@Injectable()
export class PersonTasks {
  @InjectRepository(FaceEntity) private faceRepo: EntityRepository<FaceEntity>;
  @InjectRepository(PersonEntity) private personRepo: EntityRepository<PersonEntity>;
  private logger = new Logger(PersonTasks.name);

  constructor(
    private personService: PersonService,
    private faceService: FaceService,
    private em: EntityManager,
  ) {}

  @Queue("IMAGE_DETECT_FACES", {
    targetConcurrency: 2,
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
    // const faces = await this.rehoboamService.detectFaces(file);
    const faces = await this.faceService.detectFaces(file.path);
    if (!faces[0]) {
      file.info.hasFaces = false;
      await this.em.persistAndFlush(file);
      return;
    }

    this.logger.debug(`Detected ${faces.length} faces in ${file.path}`);
    file.info.hasFaces = true;
    for (const face of faces) {
      if (!face.embedding) throw new Error("Face embedding expected");
      const embeddingBuffer = embeddingToBuffer({
        value: face.embedding,
      });

      let personOrPersonId: PersonEntity | number | null =
        await this.personService.findPersonFromFace(embeddingBuffer);

      if (!personOrPersonId) {
        const id = randomBytes(4).toString("hex");
        personOrPersonId = this.personRepo.create({
          name: `Unknown person ${id}`,
        });
      } else {
        this.logger.debug(`Matched face to person ${personOrPersonId}`);
      }

      this.faceRepo.create(
        {
          file: file,
          boundingBox: face.prediction.bbox,
          embedding: embeddingBuffer,
          person: personOrPersonId,
        },
        { persist: true },
      );
    }

    await this.em.persistAndFlush(file);
  }
}
