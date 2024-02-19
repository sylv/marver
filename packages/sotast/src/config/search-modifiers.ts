import { raw, type EntityManager, type QueryBuilder } from '@mikro-orm/better-sqlite';
import bytes from 'bytes';
import ms from 'ms';
import { FaceEntity } from '../modules/people/entities/face.entity.js';
import type { FileEntity } from '../modules/file/entities/file.entity.js';

function operatorToQuery(operator: string, value: unknown): unknown | undefined {
  switch (operator) {
    case 'gt': {
      return { $gt: value };
    }
    case 'gte': {
      return { $gte: value };
    }
    case 'lt': {
      return { $lt: value };
    }
    case 'lte': {
      return { $lte: value };
    }
    case 'eq': {
      return value;
    }
  }
}

export const SEARCH_MODIFIERS = [
  {
    // inpath:test
    name: 'inpath',
    aliases: ['in_path', 'path'],
    add: (value: string, queryBuilder: QueryBuilder<FileEntity>) => {
      queryBuilder.andWhere({
        path: {
          $like: `%${value}%`,
        },
      });
    },
  },
  {
    name: 'limit',
    add: (value: string, queryBuilder: QueryBuilder<FileEntity>) => {
      queryBuilder.limit(Number.parseInt(value));
    },
  },
  {
    name: 'inname',
    aliases: ['in_name', 'name', 'in_filename'],
    add: (value: string, queryBuilder: QueryBuilder<FileEntity>) => {
      queryBuilder.andWhere({
        name: {
          $like: `%${value}%`,
        },
      });
    },
  },
  {
    // size:gt:10mb
    // size:lte:10mb
    name: 'size',
    add: (value: string, queryBuilder: QueryBuilder<FileEntity>) => {
      const [operator, size] = value.split(':');
      const sizeInBytes = bytes(size);
      switch (operator) {
        case 'eq': {
          // within 1% of the size
          queryBuilder.andWhere({
            size: { $between: [sizeInBytes * 0.99, sizeInBytes * 1.01] },
          });
          break;
        }
        default: {
          const parsed = operatorToQuery(operator, sizeInBytes);
          if (parsed) queryBuilder.andWhere({ size: parsed });
        }
      }
    },
  },
  {
    // duration:gt:10m
    // duration:lte:10m
    name: 'duration',
    add: (value: string, queryBuilder: QueryBuilder<FileEntity>) => {
      queryBuilder.andWhere({ duration: { $ne: null } });
      const [operator, duration] = value.split(':');
      const durationInMs = ms(duration);
      switch (operator) {
        case 'eq': {
          // within 1% of the duration
          queryBuilder.andWhere({
            duration: { $between: [durationInMs * 0.99, durationInMs * 1.01] },
          });
          break;
        }
        default: {
          const parsed = operatorToQuery(operator, durationInMs);
          if (parsed) queryBuilder.andWhere({ duration: parsed });
        }
      }
    },
  },
  {
    name: 'ext',
    aliases: ['extension'],
    add: (value: string, queryBuilder: QueryBuilder<FileEntity>) => {
      queryBuilder.andWhere({ extension: value });
    },
  },
  {
    name: 'width',
    add: (value: string, queryBuilder: QueryBuilder<FileEntity>) => {
      const [operator, width] = value.split(':');
      const parsed = operatorToQuery(operator, Number.parseInt(width));
      if (parsed) queryBuilder.andWhere({ info: { width: parsed } });
    },
  },
  {
    name: 'height',
    add: (value: string, queryBuilder: QueryBuilder<FileEntity>) => {
      const [operator, height] = value.split(':');
      const parsed = operatorToQuery(operator, Number.parseInt(height));
      if (parsed) queryBuilder.andWhere({ info: { height: parsed } });
    },
  },
  {
    name: 'face',
    add: (value: string, queryBuilder: QueryBuilder<FileEntity>, em: EntityManager) => {
      // value is a faceId
      // we use cosine similarity on the face vector to find media
      // with similar faces to the given faceId
      const faceQuery = em
        .createQueryBuilder(FaceEntity)
        .where({ id: value })
        .orWhere({
          person: {
            tag: value,
          },
        })
        .select('vector');

      queryBuilder
        .addSelect(
          raw('cosine_similarity(faces.vector, :vector) as similarity', {
            vector: faceQuery.getKnexQuery(),
          }),
        )
        .andWhere({
          similarity: {
            $gt: 0.4,
          },
        })
        .orderBy({
          similarity: 'DESC',
        });
    },
  },
  {
    name: 'has_ocr',
    add: (value: string, queryBuilder: QueryBuilder<FileEntity>) => {
      queryBuilder.andWhere({
        info: {
          hasText: true,
        },
      });
    },
  },
];
