import { EntityRepository, sql, type FilterQuery, type QueryOrderMap } from "@mikro-orm/better-sqlite";
import { InjectRepository } from "@mikro-orm/nestjs";
import {
  Args,
  ArgsType,
  Field,
  ID,
  Info,
  Parent,
  Query,
  ResolveField,
  Resolver,
  registerEnumType,
} from "@nestjs/graphql";
import bytes from "bytes";
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { createConnection } from "nest-graphql-utils";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "../../constants.js";
import { AutoPopulate, inferPopulate } from "../../helpers/autoloader.js";
import { bufferToEmbedding, embeddingToBuffer } from "../../helpers/embedding.js";
import { PaginationArgs } from "../../helpers/pagination.js";
import { parseSearch } from "../../helpers/parse-search.js";
import { CLIPService } from "../clip/clip.service.js";
import { ImageService } from "../image/image.service.js";
import { FileEmbeddingEntity } from "./entities/file-embedding.entity.js";
import { FileConnection, FileEntity } from "./entities/file.entity.js";

enum FileType {
  Image = 0,
  Video = 1,
}

registerEnumType(FileType, { name: "FileType" });

enum FileSort {
  DiskCreated = 0,
  Size = 1,
  Name = 2,
  Path = 3,
}

registerEnumType(FileSort, { name: "FileSort" });

enum FileSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

registerEnumType(FileSortDirection, { name: "FileSortDirection" });

enum SimilarityType {
  Related = 0,
  Similar = 1,
  SameFolder = 2,
  SameType = 3,
  Images = 4,
  Videos = 5,
}

registerEnumType(SimilarityType, { name: "SimilarityType" });

@ArgsType()
class SimilarFilter extends PaginationArgs {
  @Field(() => SimilarityType, { nullable: true })
  @IsEnum(SimilarityType)
  type?: SimilarityType;
}

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

  @Field(() => ID, { nullable: true })
  @IsOptional()
  collectionId?: string;

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
  @InjectRepository(FileEmbeddingEntity) private fileEmbeddingRepo: EntityRepository<FileEmbeddingEntity>;

  constructor(
    private clipService: CLIPService,
    private imageService: ImageService,
  ) {}

  @Query(() => FileEntity)
  async file(@Args("id") fileId: string, @Info() info: any) {
    const populate = inferPopulate(FileEntity, "file", info);
    return this.fileRepo.findOneOrFail(fileId, {
      populate,
    });
  }

  @Query(() => FileConnection)
  async files(@Args() filter: FileFilter, @Info() info: any) {
    return createConnection({
      paginationArgs: filter,
      defaultPageSize: 25,
      paginate: async (args) => {
        const populate = inferPopulate(FileEntity, "files.edges.node", info);
        const orderBy: QueryOrderMap<FileEntity> = {};
        const filters: FilterQuery<FileEntity>[] = [
          {
            unavailable: false,
            info: { height: { $ne: null } },
          },
        ];

        if (filter.afterDate) filters.push({ createdAt: { $gte: filter.afterDate } });
        if (filter.beforeDate) filters.push({ createdAt: { $lte: filter.beforeDate } });
        if (filter.collectionId) filters.push({ collections: { id: filter.collectionId } });

        if (filter.search) {
          const parsed = parseSearch(filter.search);
          if (parsed.filters) {
            filters.push(...parsed.filters);
          }

          if (parsed.semantic_queries[0]) {
            const embedding = new Float32Array(768);
            const input = parsed.semantic_queries.map((query) => query.query);
            const encoded = await this.clipService.encodeTextBatch(input, true);
            for (let queryIndex = 0; queryIndex < parsed.semantic_queries.length; queryIndex++) {
              const semanticQuery = parsed.semantic_queries[queryIndex];
              const semanticEmbedding = encoded[queryIndex];
              for (let i = 0; i < 768; i++) {
                if (semanticQuery.negate) {
                  embedding[i] -= semanticEmbedding[i];
                } else {
                  embedding[i] += semanticEmbedding[i];
                }
              }
            }

            const serialized = embeddingToBuffer([...embedding]);
            const qb = this.fileRepo
              .createQueryBuilder()
              .select("*")
              .leftJoin("embeddings", "embeddings")
              .where({
                $and: filters,
                embeddings: { $ne: null },
              });

            // count has to happen before because performance + mikroorm bug returns count=1 every time
            const count = await qb.getCount();

            qb.addSelect(sql`MAX(cosine_similarity(${serialized}, embeddings.data)) as similarity`)
              .orderBy({ [sql`similarity`]: filter.direction })
              .groupBy("id")
              .limit(args.limit)
              .offset(args.offset);

            for (const field of populate) {
              // todo: should be handled properly, not a special case
              if (field === "preview") qb.addSelect("preview");
              else qb.leftJoinAndSelect(field, field);
            }

            const result = await qb.getResult();
            return [result, count];
          }
        }

        switch (filter.sort) {
          case FileSort.Size: {
            orderBy.size = filter.direction;
            break;
          }
          case FileSort.Name: {
            orderBy.displayName = filter.direction;
            break;
          }
          case FileSort.Path: {
            orderBy.path = filter.direction;
            break;
          }
          case FileSort.DiskCreated:
          default: {
            orderBy.createdAt = filter.direction;
          }
        }

        return this.fileRepo.findAndCount(
          { $and: filters },
          {
            limit: args.limit,
            offset: args.offset,
            populate: populate,
          },
        );
      },
    });
  }

  @ResolveField(() => FileConnection)
  async similar(
    @Parent() file: FileEntity,
    @Args() filter: SimilarFilter,

    @Info() info: any,
  ) {
    return createConnection({
      defaultPageSize: 20,
      paginationArgs: filter,
      paginate: async (args) => {
        const populate = inferPopulate(FileEntity, "similar.edges.node", info);

        // todo: this should be done in sqlite with a window function, but sqlite-loadable doesn't
        // support that yet.
        const fileEmbeddings = await this.fileEmbeddingRepo.find({ file }, { fields: ["id", "data"] });
        const merged = new Float32Array(768);
        for (const { data } of fileEmbeddings) {
          const embedding = bufferToEmbedding(data);
          for (let i = 0; i < 768; i++) {
            merged[i] += embedding[i];
          }
        }

        const mergedSerialized = embeddingToBuffer([...merged]);
        const queryBuilder = this.fileRepo
          .createQueryBuilder("file")
          .select("*")
          .leftJoin("embeddings", "embeddings")
          .addSelect(sql`MAX(cosine_similarity(${mergedSerialized}, embeddings.data)) as similarity`)
          .where({
            embeddings: { $ne: null },
            id: { $ne: file.id },
          })
          .groupBy("id")
          .limit(args.limit)
          .offset(args.offset);

        for (const field of populate) {
          // todo: should be handled properly, not a special case
          if (field === "preview") queryBuilder.addSelect("preview");
          else queryBuilder.leftJoinAndSelect(field, field);
        }

        if (filter.type === SimilarityType.Similar) {
          queryBuilder
            .having({
              [sql`similarity`]: {
                $gt: 0.85,
              },
            })
            .orderBy({ [sql`similarity`]: "DESC" });
        } else {
          queryBuilder
            .having({
              [sql`similarity`]: {
                // we want to avoid perfect matches or else we just get
                // files from the same set, or duplicates of the same file.
                $lt: 0.85,
                $gt: 0.3,
              },
            })
            .orderBy({ [sql`similarity`]: "DESC" });

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
  @AutoPopulate(["preview"])
  preview(@Parent() file: FileEntity) {
    if (!file.preview) return null;
    return file.preview.unwrap()?.toString("base64");
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
  @AutoPopulate(["thumbnail"])
  thumbnailUrl(@Parent() file: FileEntity) {
    return this.imageService.createMediaProxyUrl(file);
  }
}
