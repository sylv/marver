import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Field, ObjectType } from '@nestjs/graphql';
import { CompletionEntity } from './completion.entity.js';

@Entity()
@ObjectType('CompletionExample')
export class CompletionExampleEntity {
  @ManyToOne(() => CompletionEntity, { eager: true, primary: true, onDelete: 'cascade' })
  @Field(() => CompletionEntity)
  completion: CompletionEntity;

  @ManyToOne(() => CompletionEntity, { eager: true, primary: true, onDelete: 'cascade' })
  @Field(() => CompletionEntity)
  example: CompletionEntity;

  @Property()
  @Field()
  similarity: number;
}
