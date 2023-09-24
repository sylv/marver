import {
  EntityManager,
  QueryOrder,
  type EntityRepository,
  type ObjectQuery,
  type QueryOrderMap,
} from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Args, ArgsType, Field, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { createConnection } from 'nest-graphql-utils';
import { PaginationArgs } from '../../pagination.js';
import {
  CompletionConnection,
  CompletionEntity,
  CompletionState,
} from './entities/completion.entity.js';

@ArgsType()
class CompletionFilter extends PaginationArgs {
  @Field(() => CompletionState, { nullable: true })
  @IsEnum(CompletionState)
  @IsOptional()
  state?: CompletionState;
}

@Resolver(() => CompletionEntity)
export class RehoboamResolver {
  @InjectRepository(CompletionEntity) private completionRepo: EntityRepository<CompletionEntity>;
  constructor(private em: EntityManager) {}

  @Query(() => CompletionConnection)
  async completions(@Args() query: CompletionFilter) {
    const filter: ObjectQuery<CompletionEntity> = {};
    const orderBy: QueryOrderMap<CompletionEntity> = {};
    if (query.state != null) {
      filter.state = query.state;
      switch (query.state) {
        case CompletionState.PendingCompletion:
          orderBy.updatedAt = QueryOrder.ASC;
          break;
        default:
          orderBy.updatedAt = QueryOrder.DESC;
      }
    }

    return createConnection({
      paginationArgs: query,
      defaultPageSize: 10,
      paginate: async (args) => {
        return this.completionRepo.findAndCount(filter, {
          limit: args.limit,
          offset: args.offset,
          populate: ['examples'],
        });
      },
    });
  }

  @Mutation(() => CompletionEntity)
  async verifyCompletion(@Args({ name: 'id', type: () => ID }) id: number) {
    // todo: compute embedding so it can be used for examples
    const completion = await this.completionRepo.findOneOrFail(id);
    completion.state = CompletionState.VerifiedManual;
    await this.em.persistAndFlush(completion);
    return completion;
  }

  @Mutation(() => CompletionEntity)
  async rejectCompletion(@Args({ name: 'id', type: () => ID }) id: number) {
    const completion = await this.completionRepo.findOneOrFail(id, { populate: ['examples'] });
    completion.state = CompletionState.PendingCompletion;
    completion.embedding = undefined;
    completion.result = undefined;
    completion.alwaysInclude = false;
    completion.examples.removeAll();
    await this.em.persistAndFlush(completion);
    return completion;
  }
}
