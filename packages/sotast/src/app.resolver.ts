import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { SERVER_INFO } from './constants.js';

@ObjectType()
class ServerInfo {
  @Field(() => String)
  version: string;

  @Field(() => String)
  commit: string;

  @Field(() => String)
  branch: string;

  @Field(() => Date)
  buildDate: Date;
}

@Resolver()
export class AppResolver {
  @Query(() => ServerInfo)
  serverInfo(): ServerInfo {
    return {
      ...SERVER_INFO,
      buildDate: new Date(SERVER_INFO.buildDate),
    };
  }
}
