import { EntityManager, EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IMAGE_EXTENSIONS } from '../../constants.js';
import { embeddingToBuffer } from '../../helpers/embedding.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { Queue } from '../queue/queue.decorator.js';
import { RehoboamService } from '../rehoboam/rehoboam.service.js';
import { FaceEntity } from './entities/face.entity.js';

@Injectable()
export class PersonTasks {
  @InjectRepository(FaceEntity) private faceRepo: EntityRepository<FaceEntity>;

  constructor(
    private rehoboamService: RehoboamService,
    private em: EntityManager,
  ) {}

  // @Queue('IMAGE_DETECT_FACES', {
  //   targetConcurrency: 1,
  //   fileFilter: {
  //     extension: {
  //       $in: [...IMAGE_EXTENSIONS],
  //     },
  //     info: {
  //       height: { $ne: null },
  //       hasFaces: null,
  //     },
  //   },
  // })
  // async detectFaces(file: FileEntity) {
  //   const faces = this.rehoboamService.detectFaces(file);
  //   for await (const face of faces) {
  //     file.info.hasFaces = true;
  //     this.faceRepo.create(
  //       {
  //         file: file,
  //         boundingBox: face.bounding_box!,
  //         vector: embeddingToBuffer(face.embedding!),
  //       },
  //       { persist: true },
  //     );
  //   }

  //   if (file.info.hasFaces !== true) file.info.hasFaces = false;
  //   this.em.persist(file);
  //   await this.em.flush();
  // }
}
