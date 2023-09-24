import {
  BeforeCreate,
  BeforeUpdate,
  Collection,
  Entity,
  Enum,
  OneToMany,
  OptionalProps,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';
import { Connection } from 'nest-graphql-utils';
import { hashObject } from '../../../helpers/hash-object.js';
import { CompletionExampleEntity } from './completion-example.entity.js';

export enum CompletionState {
  PendingCompletion,
  PendingVerification,
  /**
   * Automatically accepted because it is a close match to a manually verified completion.
   * May be used as an example, but Manual should be prioritized.
   * Should be ignored completely if there are a lot of manual completions.
   */
  VerifiedHybrid,
  /**
   * Automatically accepted with no real criteria.
   * May be accurate, but cannot be used as an example as it may be flawed.
   */
  VerifiedAuto,
  /**
   * Manually verified by a human.
   * Can be used as an example.
   */
  VerifiedManual,
  /**
   * This is part of the default examples that comes with marver.
   * This also means it was never actually "completed" by the LLM.
   */
  BuiltIn,
  Error,
}

registerEnumType(CompletionState, { name: 'CompletionState' });

/** This is necessary for MikroORM property validation to pass when ordering by similarity, a computed property. */
@ObjectType({ isAbstract: true })
abstract class CompletionSortingProps {
  @Property({ persist: false })
  similarity?: number;
}

@Entity()
@ObjectType('Completion')
export class CompletionEntity<
  DataType = Record<string, unknown>,
  ResultType = unknown,
> extends CompletionSortingProps {
  @PrimaryKey({ autoincrement: true })
  @Field(() => ID)
  id: number;

  @Property()
  @Field()
  type: string;

  @Property({ type: 'jsonb' })
  @Field(() => GraphQLJSONObject)
  data: ResultType;

  @Property({ nullable: true })
  @Field(() => String, { nullable: true })
  errorMessage?: string;

  // todo: this is really, *really* gross but the only other option is
  // matching on the full serialized object which is subject to things like
  // property key ordering and other things that are not guaranteed to be stable.
  @Property({ type: 'blob' })
  dataHash: Buffer;

  @Property({ type: 'blob', nullable: true })
  embedding?: Buffer;

  @Property({ type: 'jsonb', nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  result?: DataType;

  @OneToMany(() => CompletionExampleEntity, (example) => example.completion, {
    orphanRemoval: true,
  })
  @Field(() => [CompletionExampleEntity], {
    description: 'Examples used for this completion',
    defaultValue: [],
  })
  examples = new Collection<CompletionExampleEntity>(this);

  @Enum(() => CompletionState)
  @Field(() => CompletionState)
  state: CompletionState;

  // todo: this should be a "weight" or "priority",
  // the higher the priority the higher the chance its
  // included, then we just fill up the context until
  // we hit the max length.
  @Property()
  @Field()
  alwaysInclude: boolean = false;

  @Property()
  @Field()
  createdAt: Date = new Date();

  @Field()
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  [OptionalProps]:
    | 'createdAt'
    | 'alwaysInclude'
    | 'verified'
    | 'dataHash'
    | 'examplesSimilarity'
    | 'updatedAt';

  @Field(() => Number, { nullable: true })
  get examplesSimilarity() {
    if (this.examples.length === 0) return null;
    // get the average of the closest 3 examples
    // the llm is most likely to pick the first few examples because they are closer
    // in the prompt, and the other examples are unlikely to be such a close match.
    const top3 = this.examples
      .getItems()
      .map((item) => item.similarity)
      .sort((a, b) => b - a)
      .slice(3);

    return top3.reduce((a, b) => a + b, 0) / top3.length;
  }

  @BeforeUpdate()
  @BeforeCreate()
  protected beforeCreate() {
    const hash = hashObject(this.data).digest();
    if (this.dataHash) {
      if (!this.dataHash.equals(hash)) {
        throw new Error(`Data hash mismatch: ${this.dataHash} !== ${hash}`);
      }
    } else {
      this.dataHash = hash;
    }

    if (this.alwaysInclude || this.state === CompletionState.BuiltIn) {
      // we have to do some additional validation, because the embedding should always exist
      // for these states.
      if (!this.embedding) {
        throw new Error(`Embedding is required for always included and built-in completions`);
      }
    }
  }
}

@ObjectType()
export class CompletionConnection extends Connection(CompletionEntity, {
  edgeName: 'CompletionEdge',
}) {}
