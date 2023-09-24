import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import bytes from 'bytes';
import { FileInfoEmbeddable } from './entities/file-info.embeddable.js';

@Resolver(() => FileInfoEmbeddable)
export class FileInfoResolver {
  @ResolveField(() => String)
  sizeFormatted(@Parent() metadata: FileInfoEmbeddable) {
    return bytes(metadata.size);
  }
}
