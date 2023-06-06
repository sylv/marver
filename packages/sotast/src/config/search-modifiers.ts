import { EntityManager, QueryBuilder } from '@mikro-orm/better-sqlite';
import bytes from 'bytes';
import ms from 'ms';
import { Media } from '../modules/media/entities/media.entity.js';
import { Face } from '../modules/people/entities/face.entity.js';
import { config } from '../config.js';

function operatorToQuery(operator: string, value: unknown): unknown | undefined {
  switch (operator) {
    case 'gt':
      return { $gt: value };
    case 'gte':
      return { $gte: value };
    case 'lt':
      return { $lt: value };
    case 'lte':
      return { $lte: value };
    case 'eq':
      return value;
  }
}

export const SEARCH_MODIFIERS = [
  {
    // inpath:test
    name: 'inpath',
    aliases: ['in_path', 'path'],
    add: (value: string, queryBuilder: QueryBuilder<Media>) => {
      queryBuilder.andWhere({
        file: {
          path: {
            $like: `%${value}%`,
          },
        },
      });
    },
  },
  {
    name: 'limit',
    add: (value: string, queryBuilder: QueryBuilder<Media>) => {
      queryBuilder.limit(parseInt(value));
    },
  },
  {
    name: 'inname',
    aliases: ['in_name', 'name', 'in_filename'],
    add: (value: string, queryBuilder: QueryBuilder<Media>) => {
      queryBuilder.andWhere({
        file: {
          name: {
            $like: `%${value}%`,
          },
        },
      });
    },
  },
  {
    // size:gt:10mb
    // size:lte:10mb
    name: 'size',
    add: (value: string, queryBuilder: QueryBuilder<Media>) => {
      const [operator, size] = value.split(':');
      const sizeInBytes = bytes(size);
      switch (operator) {
        case 'eq':
          // within 1% of the size
          queryBuilder.andWhere({
            file: { metadata: { size: { $between: [sizeInBytes * 0.99, sizeInBytes * 1.01] } } },
          });
          break;
        default:
          const parsed = operatorToQuery(operator, sizeInBytes);
          if (parsed) queryBuilder.andWhere({ file: { metadata: { size: parsed } } });
      }
    },
  },
  {
    // duration:gt:10m
    // duration:lte:10m
    name: 'duration',
    add: (value: string, queryBuilder: QueryBuilder<Media>) => {
      queryBuilder.andWhere({ duration: { $ne: null } });
      const [operator, duration] = value.split(':');
      const durationInMs = ms(duration);
      switch (operator) {
        case 'eq':
          // within 1% of the duration
          queryBuilder.andWhere({ duration: { $between: [durationInMs * 0.99, durationInMs * 1.01] } });
          break;
        default:
          const parsed = operatorToQuery(operator, durationInMs);
          if (parsed) queryBuilder.andWhere({ duration: parsed });
      }
    },
  },
  {
    name: 'ext',
    aliases: ['extension'],
    add: (value: string, queryBuilder: QueryBuilder<Media>) => {
      queryBuilder.andWhere({ file: { extension: value } });
    },
  },
  {
    name: 'favourite',
    aliases: ['favourited'],
    add: (value: string, queryBuilder: QueryBuilder<Media>) => {
      const isTrue = value === 'true' || value === '1' || value === 'yes';
      queryBuilder.andWhere({ file: { metadata: { favourite: isTrue } } });
    },
  },
  {
    name: 'width',
    add: (value: string, queryBuilder: QueryBuilder<Media>) => {
      const [operator, width] = value.split(':');
      const parsed = operatorToQuery(operator, parseInt(width));
      if (parsed) queryBuilder.andWhere({ width: parsed });
    },
  },
  {
    name: 'height',
    add: (value: string, queryBuilder: QueryBuilder<Media>) => {
      const [operator, height] = value.split(':');
      const parsed = operatorToQuery(operator, parseInt(height));
      if (parsed) queryBuilder.andWhere({ height: parsed });
    },
  },
  {
    name: 'face',
    add: (value: string, queryBuilder: QueryBuilder<Media>, em: EntityManager) => {
      // value is a faceId
      // we use cosine similarity on the face vector to find media
      // with similar faces to the given faceId
      const faceQuery = em
        .createQueryBuilder(Face)
        .where({ id: value })
        .orWhere({
          person: {
            tag: value,
          },
        })
        .select('vector');

      queryBuilder
        .addSelect(
          queryBuilder.raw('cosine_similarity(faces.vector, :vector) as similarity', {
            vector: faceQuery.getKnexQuery(),
          })
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
];
