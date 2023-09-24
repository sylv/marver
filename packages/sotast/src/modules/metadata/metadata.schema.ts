import { object, string, number, discriminatedUnion, literal, array } from 'zod';
import { MetadataCategory } from './entities/metadata.entity.js';

const MetadataGenericSchema = object({
  category: literal(MetadataCategory.Generic),
  title: string().nullable(),
  sources: array(string()).nullable().optional(),
  artists: array(string()).nullable().optional(),
  contentIds: array(string()).nullable().optional(),
  galleryIndex: number().nullable().optional(),
  locationName: string().nullable().optional(),
  partialDate: array(number().nullable()).nullable().optional(),
});

const MetadataMovieSchema = object({
  category: literal(MetadataCategory.Movie),
  title: string(),
  year: number().nullable().optional(),
  imdbId: string().nullable().optional(),
  tvdbId: string().nullable().optional(),
});

export const MetadataSeriesSchema = object({
  title: string(),
  year: number().nullable().optional(),
  imdbId: string().nullable().optional(),
  tvdbId: string().nullable().optional(),
});

const MetadataEpisodeSchema = object({
  category: literal(MetadataCategory.TVEpisode),
  seasonNumber: number(),
  episodeNumbers: array(number()),
  episodeName: string().nullable().optional(),
  series: MetadataSeriesSchema,
});

export const MetadataSchema = discriminatedUnion('category', [
  MetadataGenericSchema,
  MetadataMovieSchema,
  // This is not included because it is not something rehoboam would
  // be given to complete.
  // MetadataSeriesSchema,
  MetadataEpisodeSchema,
]);
