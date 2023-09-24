import { DiscoveryService } from '@golevelup/nestjs-discovery';
import type { EntityRepository } from '@mikro-orm/sqlite';
import { EntityManager, MikroORM, RequestContext, UseRequestContext } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import JSON5 from 'json5';
import PQueue from 'p-queue';
import { setTimeout as sleep } from 'timers/promises';
import type { ZodSchema, z } from 'zod';
import { config } from '../../config.js';
import { embeddingToBuffer } from '../../helpers/embedding.js';
import { hashObject } from '../../helpers/hash-object.js';
import { CALLBACK_METADATA_KEY, type CallbackMetadata } from './decorators/callback.decorator.js';
import { CompletionExampleEntity } from './entities/completion-example.entity.js';
import { CompletionEntity, CompletionState } from './entities/completion.entity.js';
import { LlamaCppService, type Message } from './integrations/llama-cpp.service.js';
import { stripEmptyKeys } from '../../helpers/strip-empty-keys.js';

type CompletionCallback<SchemaType extends ZodSchema, DataType = unknown> = (
  data: DataType,
  result: z.infer<SchemaType>,
) => Promise<void> | void;

@Injectable()
export class RehoboamService implements OnApplicationBootstrap {
  @InjectRepository(CompletionEntity) private completionRepo: EntityRepository<CompletionEntity>;
  @InjectRepository(CompletionExampleEntity)
  private completionExampleRepo: EntityRepository<CompletionExampleEntity>;

  private log = new Logger(RehoboamService.name);
  private callbacks = new Map<
    string,
    CallbackMetadata<unknown, any> & { method: CompletionCallback<any, any> }
  >();

  constructor(
    private discoveryService: DiscoveryService,
    private llamaService: LlamaCppService,
    private em: EntityManager,
    protected orm: MikroORM,
  ) {}

  async onApplicationBootstrap() {
    const providerMethods =
      await this.discoveryService.providerMethodsWithMetaAtKey<CallbackMetadata<unknown, any>>(
        CALLBACK_METADATA_KEY,
      );

    for (const providerMethod of providerMethods) {
      const method = providerMethod.discoveredMethod.handler.bind(
        providerMethod.discoveredMethod.parentClass.instance,
      );

      this.callbacks.set(providerMethod.meta.type, {
        ...providerMethod.meta,
        method: method,
      });
    }

    const scanDelay = config.is_development ? 500 : 5000;
    setTimeout(async () => {
      try {
        // examples have to be loaded before the request scanner starts
        this.log.log(
          `Loading rehoboam task examples. LLM tasks will be paused until this completes.`,
        );

        for (const providerMethod of providerMethods) {
          await this.loadExamples(providerMethod.meta);
        }

        this.log.log(`Finished loading rehoboam task examples`);
        void this.scanForRequest();
      } catch (error: any) {
        this.log.error(error, error.stack);
        process.exit(1);
      }
    }, scanDelay);
  }

  /**
   * Queue a completion request.
   * The callback will be called when the competion is finished - that could be in a few seconds, or a few days.
   */
  async queueCompletion<
    SchemaType extends ZodSchema,
    CallbackData,
    Callback extends CompletionCallback<SchemaType, CallbackData>,
  >(callback: Callback, data: CallbackData) {
    const reflector = new Reflector();
    const metadata = reflector.get<CallbackMetadata | undefined>(CALLBACK_METADATA_KEY, callback);
    if (!metadata) throw new Error('Callback metadata not found');
    const completion = this.completionRepo.create({
      state: CompletionState.PendingCompletion,
      type: metadata.type,
      data: data,
    });

    await this.em.persistAndFlush(completion);
    return completion;
  }

  /**
   * Process a pending completion, passing it to the LLM and storing the result.
   */
  private async processRequest(pendingCompletion: CompletionEntity) {
    if (pendingCompletion.state !== CompletionState.PendingCompletion) {
      throw new Error('Cannot process completion that is not pending completion');
    }

    const callback = this.callbacks.get(pendingCompletion.type);
    if (!callback) {
      this.log.error(`Callback type "${pendingCompletion.type}" not found`);
      return;
    }

    const embeddingStr = callback.prompt.embedding(pendingCompletion.data);
    const embedding = await this.llamaService.embedding(embeddingStr);
    const examplesQuery = this.completionRepo.createQueryBuilder();
    examplesQuery
      .select('*')
      .where({
        type: callback.type,
        result: { $ne: null },
        embedding: { $ne: null },
        $or: [
          { state: CompletionState.BuiltIn },
          { state: CompletionState.VerifiedManual },
          { alwaysInclude: true, state: { $ne: CompletionState.PendingCompletion } },
        ],
      })
      .addSelect(
        examplesQuery.raw(`cosine_similarity(embedding, :embedding) as similarity`, {
          embedding: embeddingToBuffer(embedding),
        }),
      )
      .orderBy({
        similarity: 'DESC',
      })
      .limit(10);

    const exampleCompletions = await examplesQuery.getResultList();
    const result = await this.llamaService.complete({
      messages: [
        // todo: query the Completion table for verified completions, ordering by
        // an embedding similarity score to this request's instruction.
        // that way we can feed in examples that are similar to what we're sending in.
        {
          role: 'system',
          content: callback.prompt.system,
        },
        ...exampleCompletions.reverse().flatMap<Message>((completion) => [
          {
            role: 'user',
            content: callback.prompt.instruction(completion.data),
          },
          {
            role: 'assistant',
            // todo: whether to pretty-print json should be configurable.
            // for paid models, you would want minified json to safe token counts.
            // for smaller local models, you want pretty print because it helps them (somehow, idfk)
            content: JSON5.stringify(stripEmptyKeys(completion.result!), null, 2),
          },
        ]),
        {
          role: 'user',
          content: callback.prompt.instruction(pendingCompletion.data),
        },
      ],
    });

    const json = JSON5.parse(result);
    const validate = (callback.schema as ZodSchema).safeParse(json);
    if (!validate.success) {
      // todo: retry, feeding the LLM the validation error.
      // in theory we can force the LLM to never return invalid results,
      // but in practice the grammar generated from the schema is not always
      // 1:1 (for example, unimplemented or unenforcable constraints).

      // todo: retrying blindly here is bad for paid backends,
      // it should be confiurable whether to retry or just give up.
      pendingCompletion.state = CompletionState.Error;
      pendingCompletion.errorMessage = validate.error?.message;
      this.log.error(`Invalid completion result for callback "${pendingCompletion.type}"`, {
        data: pendingCompletion.data,
        input: json,
        error: validate.error,
      });

      this.em.persist(pendingCompletion);
      await this.em.flush();
      return;
    }

    // todo: this is where we should check using hybrid/auto modes
    pendingCompletion.state = CompletionState.PendingVerification;
    pendingCompletion.result = validate.data;
    pendingCompletion.embedding = embeddingToBuffer(embedding);
    for (const exampleCompletion of exampleCompletions) {
      if (exampleCompletion.similarity == null) throw new Error('Similarity should not be null');
      const relation = this.completionExampleRepo.create({
        completion: pendingCompletion,
        example: exampleCompletion,
        similarity: exampleCompletion.similarity,
      });

      this.em.persist(relation);
    }

    this.em.persist(pendingCompletion);
    await this.em.flush();
  }

  /**
   * Scan for pending completions.
   * @warning Calling this starts a loop that runs forever.
   */
  private async scanForRequest() {
    try {
      const em = this.orm.em.fork();
      await RequestContext.createAsync(em, async () => {
        // todo: stop once the verification queue is at a configurable limit
        // or else we could burn through credits (for paid APIs) with a load
        // of generations that are invalid, but might have worked with more examples.
        const pendingCompletion = await this.completionRepo.findOne(
          {
            state: CompletionState.PendingCompletion,
            type: {
              // callbackIds can become invalid when the callback is changed.
              // we filter out requests that no longer have a callbackId associated.

              // todo: we should delete requests that do not have a valid callbackId
              // or else that data will sit untouched forever.
              $in: [...this.callbacks.keys()],
            },
          },
          {
            orderBy: { createdAt: 'ASC' },
          },
        );

        if (!pendingCompletion) {
          this.log.debug(`No pending completions found, sleeping`);
          await sleep(5000);
          return;
        }

        // todo: handle the server being down.
        // some users might run the server on their main PC with a GPU, so
        // it might not be available 24/7. if this fails due to a connection
        // error, backoff and retry in a few minutes, then open the firehose once its back.
        await this.processRequest(pendingCompletion);
      });
    } catch (error) {
      this.log.error(error);
      await sleep(5000);
    } finally {
      process.nextTick(() => {
        void this.scanForRequest();
      });
    }
  }

  @UseRequestContext()
  private async loadExamples(handler: CallbackMetadata) {
    const queue = new PQueue({ concurrency: 4 });
    const hashes = [];
    for (const example of handler.defaultExamples) {
      const dataHash = hashObject(example.data).digest();
      hashes.push(dataHash);

      const existingCompletion = await this.completionRepo.findOne({ dataHash });
      if (existingCompletion) continue;

      queue.add(async () => {
        const embeddingStr = handler.prompt.embedding(example.data);
        const embedding = await this.llamaService.embedding(embeddingStr);
        const completion = this.completionRepo.create({
          state: CompletionState.BuiltIn,
          type: handler.type,
          data: example.data,
          embedding: embeddingToBuffer(embedding),
          result: example.result,
        });

        await this.em.persistAndFlush(completion);
      });
    }

    await queue.onIdle();

    // todo: this is causing weird foreign key errors which should be fine
    // but apparently are not.
    // await this.completionRepo.nativeDelete({
    //   type: handler.type,
    //   state: CompletionState.BuiltIn,
    //   dataHash: {
    //     $nin: hashes,
    //   },
    // });

    this.log.debug(`Loaded all examples for callback "${handler.type}"`);
  }
}
