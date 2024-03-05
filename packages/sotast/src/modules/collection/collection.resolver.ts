import { EntityRepository, sql } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Args, Info, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { IMAGE_EXTENSIONS } from '../../constants';
import { inferPopulate } from '../../helpers/autoloader';
import { FileEntity } from '../file/entities/file.entity';
import { CollectionEntity } from './collection.entity';

@Resolver(() => CollectionEntity)
export class CollectionResolver {
  @InjectRepository(FileEntity) private fileRepo: EntityRepository<FileEntity>;
  @InjectRepository(CollectionEntity) private collectionRepo: EntityRepository<CollectionEntity>;

  @Query(() => [CollectionEntity])
  async collections(@Info() info: any) {
    const populate = inferPopulate(CollectionEntity, 'collections', info);
    return this.collectionRepo.find({ parent: null }, { populate });
  }

  @Query(() => CollectionEntity)
  async collection(@Info() info: any, @Args('id') id: string) {
    const populate = inferPopulate(CollectionEntity, 'collection', info);
    return this.collectionRepo.findOneOrFail({ id }, { populate });
  }

  @ResolveField(() => [FileEntity])
  async previewFiles(@Parent() collection: CollectionEntity) {
    const childCollectionQueryIds = sql`
      WITH RECURSIVE collection_hierarchy AS (
        SELECT id
        FROM collections
        WHERE id = ${collection.id}

        UNION ALL

        SELECT c.id
        FROM collections c
        JOIN collection_hierarchy ch ON c.parent_id = ch.id
      )
      SELECT id
      FROM collection_hierarchy;
    `;

    const em = this.collectionRepo.getEntityManager();
    const childCollectionIds = await em.execute(childCollectionQueryIds.sql, childCollectionQueryIds.params);
    console.log({ childCollectionIds });

    return this.fileRepo.find(
      {
        collections: { $in: childCollectionIds.map((item) => item.id) },
        preview: { $ne: null },
        $or: [
          // videos/etc with a thumbnail we can display
          { thumbnail: { $ne: null } },
          // images, which dont have thumbnail set but the client can still render a preview.
          { extension: { $in: [...IMAGE_EXTENSIONS] } },
        ],
      },
      {
        limit: 4,
      },
    );
  }

  @ResolveField(() => Number)
  async fileCount(@Parent() collection: CollectionEntity) {
    const em = this.collectionRepo.getEntityManager();
    const query = sql`
        WITH RECURSIVE collection_hierarchy AS (
          SELECT id
          FROM collections
          WHERE id = ${collection.id}

          UNION ALL

        SELECT c.id
          FROM collections c
          JOIN collection_hierarchy ch ON c.parent_id = ch.id
      )
      SELECT COUNT(DISTINCT cf.file_entity_id) AS file_count
      FROM collection_hierarchy ch
      JOIN collections_files cf ON ch.id = cf.collection_entity_id;
    `;

    const result = await em.execute(query.sql, query.params);
    return result[0].file_count;
  }
}
