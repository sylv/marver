/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: unknown; output: unknown; }
};

export type BoundingBox = {
  __typename?: 'BoundingBox';
  x1: Scalars['Float']['output'];
  x2: Scalars['Float']['output'];
  y1: Scalars['Float']['output'];
  y2: Scalars['Float']['output'];
};

export type Face = {
  __typename?: 'Face';
  boundingBox: BoundingBox;
  id: Scalars['ID']['output'];
  person?: Maybe<Person>;
};

export type File = {
  __typename?: 'File';
  checkedAt: Scalars['DateTime']['output'];
  corrupted: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  directory: Scalars['String']['output'];
  exifData?: Maybe<FileExifData>;
  extension?: Maybe<Scalars['String']['output']>;
  faces: Array<Face>;
  id: Scalars['ID']['output'];
  indexedAt: Scalars['DateTime']['output'];
  info: FileInfo;
  mimeType?: Maybe<Scalars['String']['output']>;
  modifiedAt: Scalars['DateTime']['output'];
  name: Scalars['String']['output'];
  path: Scalars['String']['output'];
  poster: FilePoster;
  previewBase64?: Maybe<Scalars['String']['output']>;
  similar: FileConnection;
  size: Scalars['Float']['output'];
  sizeFormatted: Scalars['String']['output'];
  tags: Array<FileTag>;
  texts: Array<FileText>;
  thumbnail: FileThumbnail;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  timeline: FileTimeline;
  type?: Maybe<FileType>;
  unavailable: Scalars['Boolean']['output'];
};


export type FileSimilarArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Float']['input']>;
  last?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  type?: InputMaybe<SimilarityType>;
};

export type FileConnection = {
  __typename?: 'FileConnection';
  edges: Array<FileEdge>;
  pageInfo: PageInfo;
  /** Total number of FileEntity items */
  totalCount: Scalars['Int']['output'];
};

/** Provides FileEntity item and a cursor to its position */
export type FileEdge = {
  __typename?: 'FileEdge';
  /** The position of this FileEntity item */
  cursor: Scalars['String']['output'];
  node: File;
};

export type FileExifData = {
  __typename?: 'FileExifData';
  cameraMake?: Maybe<Scalars['String']['output']>;
  cameraModel?: Maybe<Scalars['String']['output']>;
  dateTime?: Maybe<Scalars['DateTime']['output']>;
  exposureTime?: Maybe<Scalars['String']['output']>;
  fNumber?: Maybe<Scalars['String']['output']>;
  flash?: Maybe<Scalars['String']['output']>;
  focalLength?: Maybe<Scalars['String']['output']>;
  iso?: Maybe<Scalars['Float']['output']>;
  latitude?: Maybe<Scalars['Float']['output']>;
  lensMake?: Maybe<Scalars['String']['output']>;
  lensModel?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
};

export type FileInfo = {
  __typename?: 'FileInfo';
  audioChannels?: Maybe<Scalars['Float']['output']>;
  audioCodec?: Maybe<Scalars['String']['output']>;
  bitrate?: Maybe<Scalars['Float']['output']>;
  durationFormatted?: Maybe<Scalars['String']['output']>;
  durationSeconds?: Maybe<Scalars['Float']['output']>;
  framerate?: Maybe<Scalars['Float']['output']>;
  hasEmbeddedSubtitles?: Maybe<Scalars['Boolean']['output']>;
  hasFaces?: Maybe<Scalars['Boolean']['output']>;
  /** Whether text coudl be found in the image or video */
  hasText?: Maybe<Scalars['Boolean']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  isAnimated?: Maybe<Scalars['Boolean']['output']>;
  /** Whether no subtitles could be generated from the audio on this video */
  nonVerbal?: Maybe<Scalars['Boolean']['output']>;
  videoCodec?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

export type FilePoster = {
  __typename?: 'FilePoster';
  height: Scalars['Float']['output'];
  mimeType: Scalars['String']['output'];
  width: Scalars['Float']['output'];
};

export enum FileSort {
  DiskCreated = 'DiskCreated',
  Name = 'Name',
  Path = 'Path',
  Size = 'Size'
}

export enum FileSortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type FileTag = {
  __typename?: 'FileTag';
  system: Scalars['Boolean']['output'];
  tag: Tag;
};

export type FileText = {
  __typename?: 'FileText';
  boundingBox: BoundingBox;
  code?: Maybe<Scalars['String']['output']>;
  confidence: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  text: Scalars['String']['output'];
  timestamp?: Maybe<Scalars['Float']['output']>;
  type: Scalars['Float']['output'];
};

export type FileThumbnail = {
  __typename?: 'FileThumbnail';
  height: Scalars['Float']['output'];
  mimeType: Scalars['String']['output'];
  width: Scalars['Float']['output'];
};

export type FileTimeline = {
  __typename?: 'FileTimeline';
  height: Scalars['Float']['output'];
  mimeType: Scalars['String']['output'];
  width: Scalars['Float']['output'];
};

export enum FileType {
  Image = 'Image',
  Video = 'Video'
}

export type Mutation = {
  __typename?: 'Mutation';
  runTask: Task;
};


export type MutationRunTaskArgs = {
  id: Scalars['ID']['input'];
};

/** Provides info abou the current page */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** Cursor referencing the end of the page */
  endCursor: Scalars['String']['output'];
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  /** Cursor referencing the beginning of the page */
  startCursor: Scalars['String']['output'];
};

export type Person = {
  __typename?: 'Person';
  aliases: Scalars['String']['output'];
  birthDate?: Maybe<Scalars['DateTime']['output']>;
  deathDate?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  tag: Tag;
};

export type Query = {
  __typename?: 'Query';
  file?: Maybe<File>;
  files: FileConnection;
  serverInfo: ServerInfo;
  tasks: Array<Task>;
};


export type QueryFileArgs = {
  id: Scalars['String']['input'];
};


export type QueryFilesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  afterDate?: InputMaybe<Scalars['DateTime']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  beforeDate?: InputMaybe<Scalars['DateTime']['input']>;
  direction?: InputMaybe<FileSortDirection>;
  first?: InputMaybe<Scalars['Float']['input']>;
  last?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<FileSort>;
};

export type ServerInfo = {
  __typename?: 'ServerInfo';
  branch: Scalars['String']['output'];
  buildDate: Scalars['DateTime']['output'];
  commit: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export enum SimilarityType {
  Images = 'Images',
  Related = 'Related',
  SameFolder = 'SameFolder',
  SameType = 'SameType',
  Similar = 'Similar',
  Videos = 'Videos'
}

export type Tag = {
  __typename?: 'Tag';
  name: Scalars['ID']['output'];
};

export type Task = {
  __typename?: 'Task';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nextRunAt: Scalars['Float']['output'];
  running?: Maybe<Scalars['Boolean']['output']>;
};

export type FileQueryVariables = Exact<{
  fileId: Scalars['String']['input'];
  filter?: InputMaybe<SimilarityType>;
}>;


export type FileQuery = { __typename?: 'Query', file?: { __typename?: 'File', type?: FileType | null, id: string, previewBase64?: string | null, thumbnailUrl?: string | null, path: string, name: string, size: number, sizeFormatted: string, faces: Array<{ __typename?: 'Face', id: string, boundingBox: { __typename?: 'BoundingBox', x1: number, y1: number, x2: number, y2: number }, person?: { __typename?: 'Person', id: string, name: string } | null }>, texts: Array<{ __typename?: 'FileText', id: string, text: string, code?: string | null, boundingBox: { __typename?: 'BoundingBox', x1: number, y1: number, x2: number, y2: number } }>, similar: { __typename?: 'FileConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string, endCursor: string }, edges: Array<{ __typename?: 'FileEdge', node: { __typename?: 'File', id: string, previewBase64?: string | null, thumbnailUrl?: string | null, path: string, name: string, size: number, sizeFormatted: string, info: { __typename?: 'FileInfo', height?: number | null, width?: number | null, durationFormatted?: string | null, durationSeconds?: number | null, framerate?: number | null, videoCodec?: string | null, audioCodec?: string | null } } }> }, info: { __typename?: 'FileInfo', height?: number | null, width?: number | null, durationFormatted?: string | null, durationSeconds?: number | null, framerate?: number | null, videoCodec?: string | null, audioCodec?: string | null } } | null };

export type FilesQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type FilesQuery = { __typename?: 'Query', files: { __typename?: 'FileConnection', pageInfo: { __typename?: 'PageInfo', endCursor: string, hasNextPage: boolean }, edges: Array<{ __typename?: 'FileEdge', node: { __typename?: 'File', id: string, previewBase64?: string | null, thumbnailUrl?: string | null, path: string, name: string, size: number, sizeFormatted: string, info: { __typename?: 'FileInfo', height?: number | null, width?: number | null, durationFormatted?: string | null, durationSeconds?: number | null, framerate?: number | null, videoCodec?: string | null, audioCodec?: string | null } } }> } };

export type FilePartsFragment = { __typename?: 'File', id: string, previewBase64?: string | null, thumbnailUrl?: string | null, path: string, name: string, size: number, sizeFormatted: string, info: { __typename?: 'FileInfo', height?: number | null, width?: number | null, durationFormatted?: string | null, durationSeconds?: number | null, framerate?: number | null, videoCodec?: string | null, audioCodec?: string | null } };

export type TasksQueryVariables = Exact<{ [key: string]: never; }>;


export type TasksQuery = { __typename?: 'Query', tasks: Array<{ __typename?: 'Task', id: string, name: string, description?: string | null, running?: boolean | null, nextRunAt: number }> };

export type RunTaskMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RunTaskMutation = { __typename?: 'Mutation', runTask: { __typename?: 'Task', id: string, name: string, description?: string | null, running?: boolean | null, nextRunAt: number } };

export type TaskPartsFragment = { __typename?: 'Task', id: string, name: string, description?: string | null, running?: boolean | null, nextRunAt: number };

export const FilePartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"previewBase64"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"sizeFormatted"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"durationFormatted"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"framerate"}},{"kind":"Field","name":{"kind":"Name","value":"videoCodec"}},{"kind":"Field","name":{"kind":"Name","value":"audioCodec"}}]}}]}}]} as unknown as DocumentNode<FilePartsFragment, unknown>;
export const TaskPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"running"}},{"kind":"Field","name":{"kind":"Name","value":"nextRunAt"}}]}}]} as unknown as DocumentNode<TaskPartsFragment, unknown>;
export const FileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"File"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SimilarityType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"file"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileParts"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"faces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"boundingBox"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x1"}},{"kind":"Field","name":{"kind":"Name","value":"y1"}},{"kind":"Field","name":{"kind":"Name","value":"x2"}},{"kind":"Field","name":{"kind":"Name","value":"y2"}}]}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"texts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"boundingBox"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x1"}},{"kind":"Field","name":{"kind":"Name","value":"y1"}},{"kind":"Field","name":{"kind":"Name","value":"x2"}},{"kind":"Field","name":{"kind":"Name","value":"y2"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"similar"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileParts"}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"previewBase64"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"sizeFormatted"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"durationFormatted"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"framerate"}},{"kind":"Field","name":{"kind":"Name","value":"videoCodec"}},{"kind":"Field","name":{"kind":"Name","value":"audioCodec"}}]}}]}}]} as unknown as DocumentNode<FileQuery, FileQueryVariables>;
export const FilesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Files"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"files"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileParts"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"previewBase64"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"sizeFormatted"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"durationFormatted"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"framerate"}},{"kind":"Field","name":{"kind":"Name","value":"videoCodec"}},{"kind":"Field","name":{"kind":"Name","value":"audioCodec"}}]}}]}}]} as unknown as DocumentNode<FilesQuery, FilesQueryVariables>;
export const TasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Tasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskParts"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"running"}},{"kind":"Field","name":{"kind":"Name","value":"nextRunAt"}}]}}]} as unknown as DocumentNode<TasksQuery, TasksQueryVariables>;
export const RunTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RunTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"runTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaskParts"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaskParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Task"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"running"}},{"kind":"Field","name":{"kind":"Name","value":"nextRunAt"}}]}}]} as unknown as DocumentNode<RunTaskMutation, RunTaskMutationVariables>;