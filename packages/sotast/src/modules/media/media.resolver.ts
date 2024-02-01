/* eslint-disable unicorn/no-array-callback-reference */
import { EntityRepository } from '@mikro-orm/better-sqlite';
import { wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  Args,
  ArgsType,
  Field,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
  registerEnumType,
} from '@nestjs/graphql';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { createConnection } from 'nest-graphql-utils';
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '../../constants.js';
import { embeddingToBuffer } from '../../helpers/embedding.js';
import { PaginationArgs } from '../../pagination.js';
import { ImageService } from '../image/image.service.js';
import { RehoboamService } from '../rehoboam/rehoboam.service.js';
import { MediaConnection, MediaEntity } from './entities/media.entity.js';
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

enum MediaSort {
  DiskCreated,
  Size,
  Name,
  Path,
}

enum MediaSortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(MediaSort, { name: 'MediaSort' });
registerEnumType(MediaSortDirection, { name: 'MediaSortDirection' });

@ArgsType()
class MediaFilter extends PaginationArgs {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  @Field({ nullable: true })
  search?: string;

  @Field(() => MediaSort, { nullable: true })
  @IsEnum(MediaSort)
  @IsOptional()
  sort?: MediaSort;

  @Field(() => MediaSortDirection, { nullable: true })
  @IsEnum(MediaSortDirection)
  @IsOptional()
  direction: MediaSortDirection = MediaSortDirection.DESC;

  @IsDateString()
  @IsOptional()
  @Field({ nullable: true })
  beforeDate?: Date;

  @IsDateString()
  @IsOptional()
  @Field({ nullable: true })
  afterDate?: Date;
}

@Resolver(() => MediaEntity)
export class MediaResolver {
  @InjectRepository(MediaEntity) private mediaRepo: EntityRepository<MediaEntity>;

  constructor(
    private imageService: ImageService,
    private fileService: MediaService,
    private rehoboamService: RehoboamService,
  ) {}

  @Query(() => MediaEntity, { nullable: true })
  async media(@Args('id') fileId: string) {
    return this.mediaRepo.findOne(fileId, {
      populate: ['poster', 'thumbnail', 'timeline', 'subtitles', 'faces', 'texts'],
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
          .leftJoinAndSelect('texts', 'texts')
          .where({
            file: {
              info: {
                unavailable: false,
              },
            },
          })
          .limit(args.limit)
          .offset(args.offset);

        if (filter.afterDate)
          queryBuilder.andWhere({ file: { info: { createdAt: { $gte: filter.afterDate } } } });
        if (filter.beforeDate)
          queryBuilder.andWhere({ file: { info: { createdAt: { $lte: filter.beforeDate } } } });

        // we have to do this before the search query or else mikroorm can't
        // count the files properly. it's a bug in mikroorm.
        const count = await queryBuilder.getCount();

        if (filter.search) {
          const parsedQuery = this.fileService.parseSearchQuery(filter.search, queryBuilder);
          if (parsedQuery) {
            const embedding = await this.rehoboamService.encodeText(filter.search);
            const serialized = embeddingToBuffer(embedding);
            queryBuilder
              .addSelect(
                queryBuilder.raw(`cosine_similarity(media.embedding, :embedding) as similarity`, {
                  embedding: serialized,
                }),
              )
              .orderBy({
                similarity: filter.direction,
              });
          }
        } else {
          switch (filter.sort) {
            case MediaSort.Size: {
              queryBuilder.orderBy({ file: { info: { size: filter.direction } } });
              break;
            }
            case MediaSort.Name: {
              queryBuilder.orderBy({ file: { name: filter.direction } });
              break;
            }
            case MediaSort.Path: {
              queryBuilder.orderBy({ file: { path: filter.direction } });
              break;
            }
            case MediaSort.DiskCreated:
            default: {
              queryBuilder.orderBy({ file: { info: { diskCreatedAt: filter.direction } } });
            }
          }
        }

        const results = await queryBuilder.getResultList();
        return [results, count];
      },
    });
  }

  @ResolveField(() => String, { nullable: true })
  previewBase64(@Parent() media: MediaEntity) {
    if (!media.preview) return null;
    return media.preview.toString('base64');
  }

  @ResolveField(() => MediaConnection)
  async similar(@Parent() _media: MediaEntity, @Args() filter: SimilarFilter) {
    return createConnection({
      defaultPageSize: 20,
      paginationArgs: filter,
      paginate: async (args) => {
        // todo: this is hacky but for videos we're only using the first
        // vector. photos only ever have one vector so thats fine
        const media = this.mediaRepo.getReference(_media.file.id);
        if (!wrap(media).isInitialized()) {
          console.log(media);
          throw new Error('media must be a reference');
        }

        if (!media.embedding) return [[], 0];

        // essentially we just want to find medias that are similar but not too similar.
        const queryBuilder = this.mediaRepo.createQueryBuilder('media');
        queryBuilder
          .select('*')
          .leftJoinAndSelect('file', 'file')
          .leftJoinAndSelect('poster', 'poster')
          .leftJoinAndSelect('thumbnail', 'thumbnail')
          .leftJoinAndSelect('subtitles', 'subtitles')
          .leftJoinAndSelect('faces', 'faces')
          .addSelect(
            queryBuilder.raw(`cosine_similarity(media.embedding, :embedding) as similarity`, {
              embedding: media.embedding,
            }),
          )
          .where({
            file: {
              id: { $ne: media.file.id },
              info: {
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
          case SimilarityType.Videos: {
            queryBuilder
              .andWhere({
                similarity: {
                  $lt: 0.85,
                  $gt: 0.3,
                },
              })
              .orderBy({ similarity: 'DESC' });

            switch (filter.type) {
              case SimilarityType.SameFolder: {
                queryBuilder.andWhere({ directory: media.file.directory });

                break;
              }
              case SimilarityType.SameType: {
                // todo: should use similar extensions, but mediaType is not accessible here
                // eg if its an mp4 video, it should show all videos, not just mp4s
                queryBuilder.andWhere({ extension: media.file.extension });

                break;
              }
              case SimilarityType.Videos: {
                queryBuilder.andWhere({
                  extension: {
                    $in: [...VIDEO_EXTENSIONS],
                  },
                });

                break;
              }
              case SimilarityType.Images: {
                queryBuilder.andWhere({
                  extension: {
                    $in: [...IMAGE_EXTENSIONS],
                  },
                });

                break;
              }
              // No default
            }

            break;
          }
          case SimilarityType.Similar: {
            queryBuilder
              .andWhere({
                similarity: {
                  $gt: 0.85,
                },
              })
              .orderBy({ similarity: 'DESC' });
            break;
          }
        }

        // todo: getResultAndCount() removes the similarity column,
        // but then complains that the similarity column does not exist.
        // for now, i just disabled pagination, but its likely a mikro bug.
        // return queryBuilder.getResultAndCount();
        const result = await queryBuilder.getResult();
        return [result, result.length];
      },
    });
  }

  @ResolveField(() => String, { nullable: true })
  async thumbnailUrl(@Parent() _mediaRef: MediaEntity) {
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

  @ResolveField(() => ID, { nullable: true })
  id(@Parent() media: MediaEntity) {
    return media.file.id;
  }
}
