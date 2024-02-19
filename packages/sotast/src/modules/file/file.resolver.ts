import { EntityRepository, raw, wrap } from '@mikro-orm/better-sqlite';
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
import bytes from 'bytes';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { createConnection } from 'nest-graphql-utils';
import { VIRTUAL_TAGS } from '../../config/virtual-tags.js';
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '../../constants.js';
import { embeddingToBuffer } from '../../helpers/embedding.js';
import { PaginationArgs } from '../../pagination.js';
import { RehoboamService } from '../rehoboam/rehoboam.service.js';
import { FileTagEntity } from './entities/file-tag.entity.js';
import { FileConnection, FileEntity } from './entities/file.entity.js';
import { FileService } from './file.service.js';
import { ImageService } from '../image/image.service.js';

enum FileType {
  Image,
  Video,
}

registerEnumType(FileType, { name: 'FileType' });

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

enum FileSort {
  DiskCreated,
  Size,
  Name,
  Path,
}

enum FileSortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(FileSort, { name: 'FileSort' });
registerEnumType(FileSortDirection, { name: 'FileSortDirection' });

@ArgsType()
class FileFilter extends PaginationArgs {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  @Field({ nullable: true })
  search?: string;

  @Field(() => FileSort, { nullable: true })
  @IsEnum(FileSort)
  @IsOptional()
  sort?: FileSort;

  @Field(() => FileSortDirection, { nullable: true })
  @IsEnum(FileSortDirection)
  @IsOptional()
  direction: FileSortDirection = FileSortDirection.DESC;

  @IsDateString()
  @IsOptional()
  @Field({ nullable: true })
  beforeDate?: Date;

  @IsDateString()
  @IsOptional()
  @Field({ nullable: true })
  afterDate?: Date;
}

@Resolver(() => FileEntity)
export class FileResolver {
  @InjectRepository(FileEntity) private fileRepo: EntityRepository<FileEntity>;
  @InjectRepository(FileTagEntity) private fileTagRepo: EntityRepository<FileTagEntity>;
  constructor(
    private fileService: FileService,
    private rehoboamService: RehoboamService,
    private imageService: ImageService,
  ) {}

  @Query(() => FileEntity, { nullable: true })
  async file(@Args('id') fileId: string) {
    return this.fileRepo.findOne(fileId, {
      populate: ['poster', 'thumbnail', 'timeline', 'faces', 'texts'],
    });
  }

  @Query(() => FileConnection)
  async files(@Args() filter: FileFilter) {
    return createConnection({
      paginationArgs: filter,
      defaultPageSize: 25,
      paginate: async (args) => {
        const queryBuilder = this.fileRepo
          .createQueryBuilder('file')
          .select('*')
          .leftJoinAndSelect('poster', 'poster')
          .leftJoinAndSelect('thumbnail', 'thumbnail')
          .leftJoinAndSelect('faces', 'faces')
          .leftJoinAndSelect('texts', 'texts')
          .where({
            unavailable: false,
          })
          .limit(args.limit)
          .offset(args.offset);

        if (filter.afterDate)
          queryBuilder.andWhere({ info: { createdAt: { $gte: filter.afterDate } } });
        if (filter.beforeDate)
          queryBuilder.andWhere({ info: { createdAt: { $lte: filter.beforeDate } } });

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
                raw(`cosine_similarity(file.embedding, :embedding) as similarity`, {
                  embedding: serialized,
                }),
              )
              .orderBy({
                similarity: filter.direction,
              });
          }
        } else {
          switch (filter.sort) {
            case FileSort.Size: {
              queryBuilder.orderBy({ info: { size: filter.direction } });
              break;
            }
            case FileSort.Name: {
              queryBuilder.orderBy({ name: filter.direction });
              break;
            }
            case FileSort.Path: {
              queryBuilder.orderBy({ path: filter.direction });
              break;
            }
            case FileSort.DiskCreated:
            default: {
              queryBuilder.orderBy({ createdAt: filter.direction });
            }
          }
        }

        const results = await queryBuilder.getResultList();
        return [results, count];
      },
    });
  }

  @ResolveField(() => FileConnection)
  async similar(@Parent() _file: FileEntity, @Args() filter: SimilarFilter) {
    return createConnection({
      defaultPageSize: 20,
      paginationArgs: filter,
      paginate: async (args) => {
        // graphql converts the FileEntity into a normal object. this is really annoying,
        // but we can hack around it by grabbing the "real" file from the request context.
        const file = this.fileRepo.getReference(_file.id);
        if (!wrap(file).isInitialized()) {
          throw new Error('file must be a reference');
        }

        if (!file.embedding) return [[], 0];

        // essentially we just want to find files that are similar but not too similar.
        const queryBuilder = this.fileRepo.createQueryBuilder('file');
        queryBuilder
          .select('*')
          .leftJoinAndSelect('poster', 'poster')
          .leftJoinAndSelect('thumbnail', 'thumbnail')
          .leftJoinAndSelect('faces', 'faces')
          .addSelect(
            raw(`cosine_similarity(file.embedding, :embedding) as similarity`, {
              embedding: file.embedding,
            }),
          )
          .where({
            id: { $ne: file.id },
            unavailable: false,
            $or: [
              {
                extension: { $in: [...IMAGE_EXTENSIONS] },
              },
              {
                thumbnail: { $ne: null },
              },
            ],
          })
          // dedupe files that are the same
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
                queryBuilder.andWhere({ directory: file.directory });

                break;
              }
              case SimilarityType.SameType: {
                // todo: should use similar extensions, but fileType is not accessible here
                // eg if its an mp4 video, it should show all videos, not just mp4s
                queryBuilder.andWhere({ extension: file.extension });

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

  @ResolveField(() => [FileTagEntity])
  async tags(@Parent() file: FileEntity) {
    await file.tags.init({ populate: ['tag'] });
    const fileTags = file.tags.getItems();
    const virtualTags = VIRTUAL_TAGS.filter((tag) => tag.check(file));
    for (const virtualTag of virtualTags) {
      fileTags.push(
        this.fileTagRepo.create({
          file: file,
          matchPercent: 1,
          system: true,
          tag: {
            name: virtualTag.name,
            description: virtualTag.description,
            color: virtualTag.color,
          },
        }),
      );
    }

    return fileTags;
  }

  @ResolveField(() => String, { nullable: true })
  previewBase64(@Parent() file: FileEntity) {
    if (!file.preview) return null;
    return file.preview.toString('base64');
  }

  @ResolveField(() => FileType, { nullable: true })
  type(@Parent() file: FileEntity) {
    if (!file.extension) return;
    if (IMAGE_EXTENSIONS.has(file.extension)) return FileType.Image;
    if (VIDEO_EXTENSIONS.has(file.extension)) return FileType.Video;
    return null;
  }

  @ResolveField(() => String)
  sizeFormatted(@Parent() file: FileEntity) {
    return bytes(file.size);
  }

  @ResolveField(() => String, { nullable: true })
  async thumbnailUrl(@Parent() _fileRef: { id: string }) {
    // graphql requires the @Query(() => File) or whatever be serialized
    // so it can validate fields exist, then the serialized object is passed to
    // the field resolvers. this is problematic because refs are stripped and serialized
    // as null/the ref value. so this is a hack that just gets the file from mikroorms
    // cache, which should work for now.
    // getReference() will return the cached entity instead of just a ref if its in the entity manager already.
    // todo: this is genuinely bad and unreliable.
    const media = this.fileRepo.getReference(_fileRef.id);
    if (!wrap(media).isInitialized()) {
      throw new Error('File was expected to be in the cache and initialized.');
    }

    return this.imageService.createMediaProxyUrl(media as any);
  }
}
