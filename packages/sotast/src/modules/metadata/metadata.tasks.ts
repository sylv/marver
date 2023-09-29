import type { EntityRepository } from '@mikro-orm/better-sqlite';
import { EntityManager, ref, type ObjectQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import dedent from 'dedent';
import type { z } from 'zod';
import { normalizePath } from '../../helpers/normalize-path.js';
import { FileEntity } from '../file/entities/file.entity.js';
import { Callback } from '../rehoboam/decorators/callback.decorator.js';
import { RehoboamService } from '../rehoboam/rehoboam.service.js';
import { Queue } from '../queue/queue.decorator.js';
import {
  MetadataCategory,
  MetadataEntity,
  MetadataEntityTVShow,
  type MetadataEntityUnion,
} from './entities/metadata.entity.js';
import { PersonEntity } from './entities/person.entity.js';
import { SourceEntity } from './entities/source.entity.js';
import { METADATA_EXAMPLES } from './metadata.examples.js';
import { MetadataSchema, MetadataSeriesSchema } from './metadata.schema.js';

export interface PathMetadataData {
  path: string;
}

@Injectable()
export class MetadataTasks {
  @InjectRepository(FileEntity) private fileRepo: EntityRepository<FileEntity>;
  @InjectRepository(PersonEntity) private personRepo: EntityRepository<PersonEntity>;
  @InjectRepository(SourceEntity) private sourceRepo: EntityRepository<SourceEntity>;
  @InjectRepository(MetadataEntity) private metadataRepo: EntityRepository<MetadataEntityUnion>;
  constructor(
    private rehoboamService: RehoboamService,
    private em: EntityManager,
  ) {}

  @Queue('EXTRACT_METADATA', {
    targetConcurrency: 1,
    thirdPartyDependant: false,
    lockTask: true,
    fileFilter: {
      media: {
        metadata: null,
      },
    },
  })
  async extractMetadata(file: FileEntity) {
    const data: PathMetadataData = { path: file.path };
    await this.rehoboamService.queueCompletion(this.extractMetadataCallback, data);
  }

  @Callback<PathMetadataData, typeof MetadataSchema>({
    type: 'path_metadata',
    schema: MetadataSchema,
    defaultExamples: METADATA_EXAMPLES,
    prompt: {
      // some basic tests showed this was pretty optimal for semi-accurate matching
      // more testing is required, but idk it seems to help.
      embedding: (data) => `file_path: "${normalizePath(data.path).replaceAll(/_|\./g, ' ')}"`,
      instruction: (data) => normalizePath(data.path),
      system: dedent`
            You are a powerful labelling assistant. Users will give you paths and you will extract metadata from them.
            DO NOT guess data. If something is ambiguous, use null or undefined.
            Return an object matching the following schema:
            \`\`\`ts
            {schema}
            \`\`\`
        `,
    },
  })
  async extractMetadataCallback(data: PathMetadataData, metadata: z.infer<typeof MetadataSchema>) {
    // todo: using an LLM for every file is unbelievably wasteful.
    // it would be better if we could do some basic matching for simpler files -
    // files with an IMDb ID can just have that extracted and the rest pulled fro imdb,
    // using embeddings we could have a "simple" and "complex" diff, and if simple
    // use something like apollo with a shit load of regex. that would be a lot better,
    // reserving LLM parsing for complex use cases.
    const file = await this.fileRepo.findOneOrFail({ path: data.path });
    if (!file.media) throw new Error('File has no media entity.');
    const metadataEntity = await this.schemaToEntity(metadata);
    file.media.metadata = ref(metadataEntity);
    await this.em.persistAndFlush(file);
  }

  private async schemaToEntity(schema: z.infer<typeof MetadataSchema>) {
    switch (schema.category) {
      case MetadataCategory.Generic:
        const artists = schema.artists ? await this.resolvePersons(schema.artists) : [];
        const sources = schema.sources ? await this.resolveSources(schema.sources) : [];
        return this.metadataRepo.create({
          category: MetadataCategory.Generic,
          contentIds: schema.contentIds || [],
          galleryIndex: schema.galleryIndex || undefined,
          locationName: schema.locationName || undefined,
          partialDate: schema.partialDate,
          title: schema.title || undefined,
          artists: artists,
          sources: sources,
        });
      case MetadataCategory.Movie: {
        return this.metadataRepo.create({
          category: MetadataCategory.Movie,
          title: schema.title,
          year: schema.year || undefined,
          imdbId: schema.imdbId || undefined,
          tvdbId: schema.tvdbId || undefined,
        });
      }
      case MetadataCategory.TVEpisode: {
        const series = await this.resolveSeries(schema.series);
        return this.metadataRepo.create({
          category: MetadataCategory.TVEpisode,
          parent: series,
          seasonNumber: schema.seasonNumber,
          episodeName: schema.episodeName || undefined,
          episodeNumbers: schema.episodeNumbers,
          imdbId: schema.series.imdbId || undefined,
          tvdbId: schema.series.tvdbId || undefined,
        });
      }
    }
  }

  private async resolveSeries(
    series: z.infer<typeof MetadataSeriesSchema>,
  ): Promise<MetadataEntityTVShow> {
    const filter: ObjectQuery<MetadataEntity & MetadataEntityTVShow> = {
      category: MetadataCategory.TVShow,
    };

    // todo:
    if (series.imdbId) filter.imdbId = series.imdbId;
    else if (series.tvdbId) filter.tvdbId = series.tvdbId;
    else {
      // the year can be wrong sometimes, so we only include it
      // when matching by name to increase the chance of success.
      if (series.year) filter.year = series.year;
      filter.title = { $ilike: series.title };
    }

    const result = await this.metadataRepo.findOne(filter);
    if (result) return result as MetadataEntityTVShow;
    return this.metadataRepo.create({
      category: MetadataCategory.TVShow,
      title: series.title,
      year: series.year || undefined,
      imdbId: series.imdbId || undefined,
      tvdbId: series.tvdbId || undefined,
    }) as MetadataEntityTVShow;
  }

  private async resolveSources(names: string[]) {
    const sources = await this.sourceRepo.find({
      $or: [{ name: { $in: names } }, { aliases: { $in: names } }],
    });

    const mapped = new Map<string, SourceEntity>();
    for (const source of sources) {
      mapped.set(source.name, source);
      for (const alias of source.aliases) {
        mapped.set(alias, source);
      }
    }

    for (const name of names) {
      if (mapped.has(name)) continue;
      const source = this.sourceRepo.create({
        name: name,
        tag: {
          name: name,
        },
      });

      sources.push(source);
    }

    return sources;
  }

  private async resolvePersons(names: string[]) {
    const persons = await this.personRepo.find({
      $or: [{ name: { $in: names } }, { aliases: { $in: names } }],
    });

    const mapped = new Map<string, PersonEntity>();
    for (const person of persons) {
      mapped.set(person.name, person);
      for (const alias of person.aliases) {
        mapped.set(alias, person);
      }
    }

    for (const name of names) {
      if (mapped.has(name)) continue;
      const person = this.personRepo.create({
        name: name,
        tag: {
          name: name,
        },
      });

      persons.push(person);
    }

    return persons;
  }
}
