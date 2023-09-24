import {
  ArrayType,
  Collection,
  Entity,
  Enum,
  JsonType,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Field, ID } from '@nestjs/graphql';
import { PersonEntity } from './person.entity.js';
import { SourceEntity } from './source.entity.js';

export enum MetadataCategory {
  Generic = 'Generic', // memes, random stuff from the internet
  Movie = 'Movie',
  TVShow = 'TVShow',
  TVEpisode = 'TVShowEpisode',
}

export type PartialDate = [year: number | null, month: number | null, day: number | null];

@Entity({
  discriminatorColumn: 'category',
  abstract: true,
})
export abstract class MetadataEntity {
  @PrimaryKey({ autoincrement: true })
  @Field(() => ID)
  id: number;

  @Enum(() => MetadataCategory)
  category: MetadataCategory;
}

@Entity({ discriminatorValue: MetadataCategory.Generic })
export class MetadataEntityGeneric extends MetadataEntity {
  category: MetadataCategory.Generic;

  @Property({ nullable: true })
  title?: string;

  @ManyToMany(() => SourceEntity)
  sources = new Collection<SourceEntity>(this);

  @ManyToMany(() => PersonEntity)
  artists = new Collection<PersonEntity>(this);

  @Property({ type: ArrayType })
  contentIds: string[] = [];

  @Property({ nullable: true })
  galleryIndex?: number;

  @Property({ nullable: true })
  locationName?: string;

  @Property({ type: JsonType, nullable: true })
  partialDate?: PartialDate;
}

@Entity({ discriminatorValue: MetadataCategory.Movie })
export class MetadataEntityMovie extends MetadataEntity {
  category: MetadataCategory.Movie;

  @Property()
  title: string;

  @Property({ nullable: true })
  year?: number;

  @Property({ nullable: true })
  imdbId?: string;

  @Property({ nullable: true })
  tvdbId?: string;
}

@Entity({ discriminatorValue: MetadataCategory.TVShow })
export class MetadataEntityTVShow extends MetadataEntity {
  category: MetadataCategory.TVShow;

  @Property()
  title: string;

  @Property({ nullable: true })
  year?: number;

  @Property({ nullable: true })
  imdbId?: string;

  @Property({ nullable: true })
  tvdbId?: string;
}

@Entity({ discriminatorValue: MetadataCategory.TVEpisode })
export class MetadataEntityTVEpisode extends MetadataEntity {
  category: MetadataCategory.TVEpisode;

  @ManyToOne(() => MetadataEntityTVShow)
  parent: MetadataEntityTVShow;

  @Property({ nullable: true })
  episodeName?: string;

  @Property({ nullable: true })
  seasonNumber?: number;

  @Property({ type: 'jsonb', nullable: true })
  episodeNumbers?: number[];

  @Property({ nullable: true })
  imdbId?: string;

  @Property({ nullable: true })
  tvdbId?: string;
}

export type MetadataEntityUnion = MetadataEntity &
  (MetadataEntityGeneric | MetadataEntityMovie | MetadataEntityTVEpisode | MetadataEntityTVShow);
