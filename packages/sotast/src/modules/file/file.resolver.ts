import { EntityRepository, sql, type FilterQuery, type QueryOrderMap } from "@mikro-orm/libsql";
import { InjectRepository } from "@mikro-orm/nestjs";
import {
  Args,
  ArgsType,
  Field,
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
import { PaginationArgs } from "../../helpers/pagination.js";
import { parseSearch } from "../../helpers/parse-search.js";
import { CLIPService } from "../clip/clip.service.js";
import { ImageService } from "../image/image.service.js";
import { FileConnection, FileEntity } from "./entities/file.entity.js";
import { EntityManager } from "@mikro-orm/core";

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

  constructor(
    private clipService: CLIPService,
    private imageService: ImageService,
    private em: EntityManager,
  ) {}

  @Query(() => FileEntity)
  async file(@Args("id") fileId: string, @Info() info: any) {
    const populate = inferPopulate(FileEntity, "file", info);
    const file = await this.fileRepo.findOneOrFail(fileId, {
      populate,
    });

    file.bumpedAt = new Date();
    await this.em.flush();

    return file;
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
                  embedding[i] /= 2;
                } else {
                  embedding[i] += semanticEmbedding[i];
                  embedding[i] /= 2;
                }
              }
            }

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
            const serialized = JSON.stringify(Array.from(embedding));
            qb.addSelect(
              sql`MAX(-vector_distance_cos(vector32(${serialized}), embeddings.data)) as similarity`,
            )
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

        const files = await this.fileRepo.findAndCount(
          { $and: filters },
          {
            limit: args.limit,
            offset: args.offset,
            populate: populate,
          },
        );

        // on file view, bump the file so its tasks are run with priority
        for (const file of files[0]) file.bumpedAt = new Date();
        await this.em.flush();

        return files;
      },
    });
  }

  @ResolveField(() => String, { nullable: true })
  @AutoPopulate(["preview"])
  preview(@Parent() file: FileEntity) {
    if (!file.preview) return null;
    const preview = file.preview.unwrap();
    if (!preview) return null;
    return Buffer.from(preview).toString("base64");
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
