import type { EntityRepository, FilterQuery } from "@mikro-orm/better-sqlite";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Args, ArgsType, Field, ID, Info, Query, Resolver } from "@nestjs/graphql";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { createConnection } from "nest-graphql-utils";
import { PaginationArgs } from "../../pagination";
import { PersonConnection, PersonEntity } from "./entities/person.entity";
import { inferPopulate } from "../../helpers/autoloader";

@ArgsType()
export class PersonFilter extends PaginationArgs {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  @Field({ nullable: true })
  search?: string;
}

@Resolver(() => PersonEntity)
export class PersonResolver {
  @InjectRepository(PersonEntity) private personRepo: EntityRepository<PersonEntity>;

  @Query(() => PersonEntity)
  async person(@Args("id", { type: () => ID }) id: number, @Info() info: any) {
    const populate = inferPopulate(PersonEntity, "person", info);
    return this.personRepo.findOneOrFail(id, { populate });
  }

  @Query(() => PersonConnection)
  async people(@Args() filter: PersonFilter, @Info() info: any) {
    return createConnection({
      paginationArgs: filter,
      defaultPageSize: 25,
      paginate: async ({ limit, offset }) => {
        // const query: FilterQuery<PersonEntity> = {};
        const queries: FilterQuery<PersonEntity>[] = [];

        if (filter.search) {
          queries.push({
            $or: [
              {
                name: { $like: `%${filter.search}%` },
              },
              {
                aliases: { $like: `%${filter.search}%` },
              },
            ],
          });
        }

        const populate = inferPopulate(PersonEntity, "people", info);
        const result = await this.personRepo.findAndCount(
          { $and: queries },
          {
            limit,
            offset,
            populate,
          },
        );

        return result;
      },
    });
  }
}
