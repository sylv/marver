import { EntityManager, type QueryBuilder } from '@mikro-orm/sqlite';
import { Injectable } from '@nestjs/common';
import { SEARCH_MODIFIERS } from '../../config/search-modifiers.js';
import { type MediaEntity } from './entities/media.entity.js';

@Injectable()
export class MediaService {
  constructor(private em: EntityManager) {}

  parseSearchQuery(query: string, queryBuilder: QueryBuilder<MediaEntity>) {
    const clipSearchParts = [];
    for (const part of query.split(/(?<=")[^"]+(?=")|(?<=')[^']+(?=')|\s+/)) {
      if (part.startsWith('"') && part.endsWith('"')) {
        queryBuilder.andWhere({
          tags: {
            tag: {
              name: part.slice(1, -1),
            },
          },
        });
      } else if (part.includes(':')) {
        const [name, ...value] = part.split(':');
        const modifier = SEARCH_MODIFIERS.find(
          (mod) => mod.name === name || mod.aliases?.includes(name),
        );
        if (modifier) {
          modifier.add(value.join(':'), queryBuilder, this.em);
        } else {
          clipSearchParts.push(part);
        }
      } else {
        clipSearchParts.push(part);
      }

      if (clipSearchParts.length > 0) {
        return clipSearchParts.join(' ');
      }
    }
  }
}
