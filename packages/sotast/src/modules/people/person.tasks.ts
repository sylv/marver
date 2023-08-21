import { EntityManager, EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { File } from '../file/entities/file.entity.js';
import { SentryService } from '../sentry/sentry.service.js';
import { Task } from '../tasks/task.decorator.js';
import { TaskType } from '../tasks/task.enum.js';
import { Face } from './entities/face.entity.js';
import { Person } from './entities/person.entity.js';
import { IMAGE_EXTENSIONS } from '../../constants.js';

@Injectable()
export class PersonTasks {
  @InjectRepository(Person) private personRepo: EntityRepository<Person>;
  @InjectRepository(Face) private faceRepo: EntityRepository<Face>;

  constructor(
    private sentryService: SentryService,
    private em: EntityManager,
  ) {}

  @Task(TaskType.ImageDetectFaces, {
    concurrency: 4,
    filter: {
      extension: {
        $in: [...IMAGE_EXTENSIONS],
      },
      media: {
        height: { $ne: null },
        hasFaces: null,
      },
    },
  })
  async detectFaces(file: File) {
    const media = file.media!;
    const faces = this.sentryService.detectFaces(file);
    for await (const face of faces) {
      media.hasFaces = true;
      this.faceRepo.create(
        {
          media: media,
          boundingBox: face.bounding_box!,
          vector: this.sentryService.vectorToBuffer(face.vector!),
        },
        { persist: true },
      );
    }

    if (media.hasFaces !== true) media.hasFaces = false;
    this.em.persist(media);
    await this.em.flush();
  }
}
