import { ArgsType, Field } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  after?: string;

  @IsNumber()
  @IsOptional()
  @Field({ nullable: true })
  first?: number;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  before?: string;

  @IsNumber()
  @IsOptional()
  @Field({ nullable: true })
  last?: number;

  @IsNumber()
  @IsOptional()
  @Field({ nullable: true })
  offset?: number;
}
