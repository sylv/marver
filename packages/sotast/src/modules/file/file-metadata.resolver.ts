import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import bytes from 'bytes';
import { FileMetadata } from './entities/file-metadata.embeddable.js';

@Resolver(() => FileMetadata)
export class FileMetadataResolver {
  @ResolveField(() => String)
  sizeFormatted(@Parent() metadata: FileMetadata) {
    return bytes(metadata.size);
  }
}
