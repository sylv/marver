import type { EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Args, ArgsType, Field, Parent, Query, ResolveField, Resolver, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { createConnection } from 'nest-graphql-utils';
import { VIRTUAL_TAGS } from '../../config/virtual-tags.js';
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '../../constants.js';
import { PaginationArgs } from '../../pagination.js';
import { FileTag } from './entities/file-tag.entity.js';
import { File, FileConnection } from './entities/file.entity.js';

enum FileType {
  Image,
  Video,
}

registerEnumType(FileType, { name: 'FileType' });

@ArgsType()
class FileFilter extends PaginationArgs {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  @Field({ nullable: true })
  search?: string;
}

@Resolver(() => File)
export class FileResolver {
  @InjectRepository(File) private fileRepo: EntityRepository<File>;
  @InjectRepository(FileTag) private fileTagRepo: EntityRepository<FileTag>;

  @Query(() => File, { nullable: true })
  async file(@Args('id') id: string) {
    return this.fileRepo.findOne(id);
  }

  @Query(() => FileConnection)
  async files(@Args() filter: FileFilter) {
    return createConnection({
      paginationArgs: filter,
      defaultPageSize: 25,
      paginate: async (args) => {
        return this.fileRepo.findAndCount(
          {},
          {
            limit: args.limit,
            offset: args.offset,
          }
        );
      },
    });
  }

  @ResolveField(() => [FileTag])
  async tags(@Parent() file: File) {
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
        })
      );
    }

    return fileTags;
  }
  @ResolveField(() => FileType, { nullable: true })
  type(@Parent() file: File) {
    if (!file.extension) return;
    if (IMAGE_EXTENSIONS.has(file.extension)) return FileType.Image;
    if (VIDEO_EXTENSIONS.has(file.extension)) return FileType.Video;
    return null;
  }
}
