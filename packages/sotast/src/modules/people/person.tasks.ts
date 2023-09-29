import { EntityManager, EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IMAGE_EXTENSIONS } from '../../constants.js';
import { embeddingToBuffer } from '../../helpers/embedding.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { PersonEntity } from '../metadata/entities/person.entity.js';
import { Queue } from '../queue/queue.decorator.js';
import { SolomonService } from '../solomon/solomon.service.js';
import { FaceEntity } from './entities/face.entity.js';

@Injectable()
export class PersonTasks {
  @InjectRepository(PersonEntity) private personRepo: EntityRepository<PersonEntity>;
  @InjectRepository(FaceEntity) private faceRepo: EntityRepository<FaceEntity>;

  constructor(
    private solomonService: SolomonService,
    private em: EntityManager,
  ) {}

  @Queue('IMAGE_DETECT_FACES', {
    targetConcurrency: 4,
    thirdPartyDependant: true,
    fileFilter: {
      extension: {
        $in: [...IMAGE_EXTENSIONS],
      },
      media: {
        height: { $ne: null },
        hasFaces: null,
      },
    },
  })
  async detectFaces(file: FileEntity) {
    const media = file.media!;
    const faces = this.solomonService.detectFaces(file);
    for await (const face of faces) {
      media.hasFaces = true;
      this.faceRepo.create(
        {
          media: media,
          boundingBox: face.bounding_box!,
          vector: embeddingToBuffer(face.embedding!),
        },
        { persist: true },
      );
    }

    if (media.hasFaces !== true) media.hasFaces = false;
    this.em.persist(media);
    await this.em.flush();
  }
}
