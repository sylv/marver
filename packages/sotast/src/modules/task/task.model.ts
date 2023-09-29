import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Task')
export class TaskModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  running?: boolean;

  @Field()
  nextRunAt: number;
}
