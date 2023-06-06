import { EntityRepository } from '@mikro-orm/better-sqlite';
import { wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  Args,
  ArgsType,
  Field,
  Parent,
  Query,
  ResolveField,
  Resolver,
  registerEnumType,
} from '@nestjs/graphql';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { createConnection } from 'nest-graphql-utils';
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '../../constants.js';
import { Vector } from '../../generated/sentry.js';
import { PaginationArgs } from '../../pagination.js';
import { ImageService } from '../image/image.service.js';
import { SentryService } from '../sentry/sentry.service.js';
import { Media, MediaConnection } from './entities/media.entity.js';
import { MediaService } from './media.service.js';

enum SimilarityType {
  Related,
  Similar,
  SameFolder,
  SameType,
  Images,
  Videos,
}

@ArgsType()
class SimilarFilter extends PaginationArgs {
  @Field(() => SimilarityType, { nullable: true })
  @IsEnum(SimilarityType)
  type?: SimilarityType;
}

registerEnumType(SimilarityType, { name: 'SimilarityType' });

@ArgsType()
class MediaFilter extends PaginationArgs {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  @Field({ nullable: true })
  search?: string;

  @IsDateString()
  @IsOptional()
  @Field({ nullable: true })
  beforeDate?: Date;

  @IsDateString()
  @IsOptional()
  @Field({ nullable: true })
  afterDate?: Date;
}

@Resolver(() => Media)
export class MediaResolver {
  @InjectRepository(Media) private mediaRepo: EntityRepository<Media>;

  constructor(
    private imageService: ImageService,
    private fileService: MediaService,
    private sentryService: SentryService
  ) {}

  @Query(() => Media, { nullable: true })
  async media(@Args('id') fileId: string) {
    return this.mediaRepo.findOne(fileId, {
      populate: ['poster', 'thumbnail', 'timeline', 'subtitles', 'faces'],
    });
  }

  @Query(() => MediaConnection)
  async mediaList(@Args() filter: MediaFilter) {
    return createConnection({
      paginationArgs: filter,
      defaultPageSize: 25,
      paginate: async (args) => {
        const queryBuilder = this.mediaRepo
          .createQueryBuilder('media')
          .select('*')
          .leftJoinAndSelect('file', 'file')
          .leftJoinAndSelect('poster', 'poster')
          .leftJoinAndSelect('thumbnail', 'thumbnail')
          .leftJoinAndSelect('subtitles', 'subtitles')
          .leftJoinAndSelect('faces', 'faces')
          .where({
            file: {
              metadata: {
                unavailable: false,
              },
            },
          })
          .limit(args.limit)
          .offset(args.offset);

        if (filter.afterDate)
          queryBuilder.andWhere({ file: { metadata: { createdAt: { $gte: filter.afterDate } } } });
        if (filter.beforeDate)
          queryBuilder.andWhere({ file: { metadata: { createdAt: { $lte: filter.beforeDate } } } });

        if (filter.search) {
          const parsedQuery = this.fileService.parseSearchQuery(filter.search, queryBuilder);
          if (parsedQuery) {
            const vector = await this.sentryService.getTextVector(filter.search);
            const serialized = Buffer.from(Vector.toBinary(vector));
            queryBuilder
              .addSelect(
                queryBuilder.raw(`cosine_similarity(media.vector, :vector) as similarity`, {
                  vector: serialized,
                })
              )
              .orderBy({
                similarity: 'DESC',
              });
          }
        } else {
          queryBuilder.orderBy({
            file: {
              metadata: {
                createdAt: 'DESC',
              },
            },
          });
        }

        // return queryBuilder.getResultAndCount();
        queryBuilder.addSelect(`COUNT(*) OVER() as total`);
        const results = await queryBuilder.execute();
        const total = (results[0] as any)?.total ?? 0;
        const mapped = results.map((raw) => this.mediaRepo.map(raw));
        return [mapped, total];
      },
    });
  }

  @ResolveField(() => String, { nullable: true })
  previewBase64(@Parent() media: Media) {
    if (!media.preview) return null;
    return media.preview.toString('base64');
  }

  @ResolveField(() => MediaConnection)
  async similar(@Parent() media: Media, @Args() filter: SimilarFilter) {
    return createConnection({
      defaultPageSize: 20,
      paginationArgs: filter,
      paginate: async (args) => {
        if (!media.vector) return [[], 0];
        // essentially we just want to find medias that are similar but not too similar.
        const queryBuilder = this.mediaRepo.createQueryBuilder('media');
        const vector = media.vector;
        queryBuilder
          .select('*')
          .leftJoinAndSelect('file', 'file')
          .leftJoinAndSelect('poster', 'poster')
          .leftJoinAndSelect('thumbnail', 'thumbnail')
          .leftJoinAndSelect('subtitles', 'subtitles')
          .leftJoinAndSelect('faces', 'faces')
          .addSelect(
            queryBuilder.raw(`cosine_similarity(media.vector, :vector) as similarity`, { vector })
          )
          .where({
            file: {
              id: { $ne: media.file.id },
              metadata: {
                unavailable: false,
              },
            },
            $or: [
              {
                file: {
                  extension: { $in: [...IMAGE_EXTENSIONS] },
                },
              },
              {
                thumbnail: { $ne: null },
              },
            ],
          })
          // dedupe medias that are the same
          .groupBy('similarity')
          .limit(args.limit)
          .offset(args.offset);

        switch (filter.type) {
          case undefined:
          case null:
          case SimilarityType.SameFolder:
          case SimilarityType.SameType:
          case SimilarityType.Related:
          case SimilarityType.Images:
          case SimilarityType.Videos:
            queryBuilder
              .andWhere({
                similarity: {
                  $lt: 0.85,
                  $gt: 0.3,
                },
              })
              .orderBy({ similarity: 'DESC' });

            if (filter.type === SimilarityType.SameFolder) {
              queryBuilder.andWhere({ directory: media.file.directory });
            } else if (filter.type === SimilarityType.SameType) {
              // todo: should use similar extensions, but mediaType is not accessible here
              // eg if its an mp4 video, it should show all videos, not just mp4s
              queryBuilder.andWhere({ extension: media.file.extension });
            } else if (filter.type === SimilarityType.Videos) {
              queryBuilder.andWhere({
                extension: {
                  $in: [...VIDEO_EXTENSIONS],
                },
              });
            } else if (filter.type === SimilarityType.Images) {
              queryBuilder.andWhere({
                extension: {
                  $in: [...IMAGE_EXTENSIONS],
                },
              });
            }

            break;
          case SimilarityType.Similar:
            queryBuilder
              .andWhere({
                similarity: {
                  $gt: 0.85,
                },
              })
              .orderBy({ similarity: 'DESC' });
            break;
        }

        // todo: getResultAndCount() removes the similarity column,
        // but then complains that the similarity column does not exist.
        // for now, i just disabled pagination, but its likely a mikro bug.
        const result = await queryBuilder.getResult();
        return [result, result.length];
      },
    });
  }

  @ResolveField(() => String, { nullable: true })
  async thumbnailUrl(@Parent() _mediaRef: Media) {
    // graphql requires the @Query(() => File) or whatever be serialized
    // so it can validate fields exist, then the serialized object is passed to
    // the field resolvers. this is problematic because refs are stripped and serialized
    // as null/the ref value. so this is a hack that just gets the file from mikroorms
    // cache, which should work for now.
    // getReference() will return the cached entity instead of just a ref if its in the entity manager already.
    // todo: this is genuinely bad and unreliable.
    const media = this.mediaRepo.getReference(_mediaRef.file.id);
    if (!wrap(media).isInitialized()) {
      throw new Error('File was expected to be in the cache and initialized.');
    }

    return this.imageService.createMediaProxyUrl(media as any);
  }
}
