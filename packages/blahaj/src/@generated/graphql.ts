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
  DateTime: { input: string; output: string; }
};

export type BoundingBox = {
  __typename?: 'BoundingBox';
  x1: Scalars['Float']['output'];
  x2: Scalars['Float']['output'];
  y1: Scalars['Float']['output'];
  y2: Scalars['Float']['output'];
};

export type Collection = {
  __typename?: 'Collection';
  aggregateFileCount: Scalars['Float']['output'];
  children: Array<Collection>;
  description?: Maybe<Scalars['String']['output']>;
  directFileCount: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parent?: Maybe<Collection>;
  previewFiles: Array<File>;
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
  collections: Array<Collection>;
  corrupted: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  directory: Scalars['String']['output'];
  exifData?: Maybe<FileExifData>;
  extension?: Maybe<Scalars['String']['output']>;
  faces: Array<Face>;
  id: Scalars['ID']['output'];
  indexedAt: Scalars['DateTime']['output'];
  info: FileInfo;
  jobStates: Array<JobState>;
  mimeType?: Maybe<Scalars['String']['output']>;
  modifiedAt: Scalars['DateTime']['output'];
  name: Scalars['String']['output'];
  path: Scalars['String']['output'];
  poster: FilePoster;
  previewBase64?: Maybe<Scalars['String']['output']>;
  similar: FileConnection;
  size: Scalars['Float']['output'];
  sizeFormatted: Scalars['String']['output'];
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

export type JobState = {
  __typename?: 'JobState';
  errorMessage?: Maybe<Scalars['String']['output']>;
  executedAt: Scalars['DateTime']['output'];
  retries: Scalars['Float']['output'];
  retryAfter?: Maybe<Scalars['Float']['output']>;
  state: State;
  type: Scalars['String']['output'];
};

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
  collection: Collection;
  collections: Array<Collection>;
  file?: Maybe<File>;
  files: FileConnection;
  serverInfo: ServerInfo;
  tasks: Array<Task>;
};


export type QueryCollectionArgs = {
  id: Scalars['String']['input'];
};


export type QueryFileArgs = {
  id: Scalars['String']['input'];
};


export type QueryFilesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  afterDate?: InputMaybe<Scalars['DateTime']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  beforeDate?: InputMaybe<Scalars['DateTime']['input']>;
  collectionId?: InputMaybe<Scalars['ID']['input']>;
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

export enum State {
  Completed = 'Completed',
  Failed = 'Failed'
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

export type CollectionPreviewPropsFragment = { __typename?: 'Collection', id: string, name: string, description?: string | null, aggregateFileCount: number, previewFiles: Array<(
    { __typename?: 'File', id: string, thumbnailUrl?: string | null, info: { __typename?: 'FileInfo', height?: number | null, width?: number | null } }
    & { ' $fragmentRefs'?: { 'ImagePropsFragment': ImagePropsFragment } }
  )> } & { ' $fragmentName'?: 'CollectionPreviewPropsFragment' };

export type FilesQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Float']['input']>;
  collectionId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type FilesQuery = { __typename?: 'Query', files: { __typename?: 'FileConnection', pageInfo: { __typename?: 'PageInfo', endCursor: string, hasNextPage: boolean }, edges: Array<{ __typename?: 'FileEdge', node: (
        { __typename?: 'File', id: string, thumbnailUrl?: string | null, info: { __typename?: 'FileInfo', height?: number | null, width?: number | null } }
        & { ' $fragmentRefs'?: { 'FilePreviewPropsFragment': FilePreviewPropsFragment } }
      ) }> } };

export type FilePreviewPropsFragment = (
  { __typename?: 'File', id: string, name: string, info: { __typename?: 'FileInfo', durationFormatted?: string | null } }
  & { ' $fragmentRefs'?: { 'ImagePropsFragment': ImagePropsFragment } }
) & { ' $fragmentName'?: 'FilePreviewPropsFragment' };

export type FileExifPropsFragment = { __typename?: 'File', exifData?: { __typename?: 'FileExifData', cameraMake?: string | null, cameraModel?: string | null, lensModel?: string | null, lensMake?: string | null, dateTime?: string | null, exposureTime?: string | null, fNumber?: string | null, flash?: string | null, focalLength?: string | null, iso?: number | null } | null } & { ' $fragmentName'?: 'FileExifPropsFragment' };

export type FileLocationPropsFragment = { __typename?: 'File', exifData?: { __typename?: 'FileExifData', longitude?: number | null, latitude?: number | null } | null } & { ' $fragmentName'?: 'FileLocationPropsFragment' };

export type FileTasksPropsFragment = { __typename?: 'File', jobStates: Array<{ __typename?: 'JobState', state: State, type: string }> } & { ' $fragmentName'?: 'FileTasksPropsFragment' };

export type ImagePropsFragment = { __typename?: 'File', name: string, thumbnailUrl?: string | null, previewBase64?: string | null, info: { __typename?: 'FileInfo', height?: number | null, width?: number | null } } & { ' $fragmentName'?: 'ImagePropsFragment' };

export type CollectionsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type CollectionsQueryQuery = { __typename?: 'Query', collections: Array<(
    { __typename?: 'Collection', id: string }
    & { ' $fragmentRefs'?: { 'CollectionPreviewPropsFragment': CollectionPreviewPropsFragment } }
  )> };

export type CollectionQueryQueryVariables = Exact<{
  collectionId: Scalars['String']['input'];
}>;


export type CollectionQueryQuery = { __typename?: 'Query', collection: { __typename?: 'Collection', id: string, name: string, description?: string | null, directFileCount: number, parent?: { __typename?: 'Collection', id: string, name: string } | null, children: Array<(
      { __typename?: 'Collection', id: string }
      & { ' $fragmentRefs'?: { 'CollectionPreviewPropsFragment': CollectionPreviewPropsFragment } }
    )> } };

export type FileQueryVariables = Exact<{
  fileId: Scalars['String']['input'];
}>;


export type FileQuery = { __typename?: 'Query', file?: (
    { __typename?: 'File', id: string, name: string, type?: FileType | null, thumbnailUrl?: string | null, info: { __typename?: 'FileInfo', height?: number | null, width?: number | null, durationSeconds?: number | null } }
    & { ' $fragmentRefs'?: { 'FileLocationPropsFragment': FileLocationPropsFragment;'FileTasksPropsFragment': FileTasksPropsFragment;'FileExifPropsFragment': FileExifPropsFragment;'ImagePropsFragment': ImagePropsFragment } }
  ) | null };

export type TasksQueryVariables = Exact<{ [key: string]: never; }>;


export type TasksQuery = { __typename?: 'Query', tasks: Array<{ __typename?: 'Task', id: string, name: string, description?: string | null, running?: boolean | null, nextRunAt: number }> };

export type RunTaskMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RunTaskMutation = { __typename?: 'Mutation', runTask: { __typename?: 'Task', id: string, nextRunAt: number, running?: boolean | null } };

export const ImagePropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewBase64"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}}]}}]}}]} as unknown as DocumentNode<ImagePropsFragment, unknown>;
export const CollectionPreviewPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CollectionPreviewProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Collection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"aggregateFileCount"}},{"kind":"Field","name":{"kind":"Name","value":"previewFiles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageProps"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewBase64"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}}]}}]}}]} as unknown as DocumentNode<CollectionPreviewPropsFragment, unknown>;
export const FilePreviewPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FilePreviewProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"durationFormatted"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageProps"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewBase64"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}}]}}]}}]} as unknown as DocumentNode<FilePreviewPropsFragment, unknown>;
export const FileExifPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileExifProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exifData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cameraMake"}},{"kind":"Field","name":{"kind":"Name","value":"cameraModel"}},{"kind":"Field","name":{"kind":"Name","value":"lensModel"}},{"kind":"Field","name":{"kind":"Name","value":"lensMake"}},{"kind":"Field","name":{"kind":"Name","value":"dateTime"}},{"kind":"Field","name":{"kind":"Name","value":"exposureTime"}},{"kind":"Field","name":{"kind":"Name","value":"fNumber"}},{"kind":"Field","name":{"kind":"Name","value":"flash"}},{"kind":"Field","name":{"kind":"Name","value":"focalLength"}},{"kind":"Field","name":{"kind":"Name","value":"iso"}}]}}]}}]} as unknown as DocumentNode<FileExifPropsFragment, unknown>;
export const FileLocationPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileLocationProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exifData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}}]}}]}}]} as unknown as DocumentNode<FileLocationPropsFragment, unknown>;
export const FileTasksPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileTasksProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobStates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<FileTasksPropsFragment, unknown>;
export const FilesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Files"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"collectionId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"files"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"collectionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"collectionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"FilePreviewProps"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewBase64"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FilePreviewProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"durationFormatted"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageProps"}}]}}]} as unknown as DocumentNode<FilesQuery, FilesQueryVariables>;
export const CollectionsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CollectionsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"CollectionPreviewProps"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewBase64"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CollectionPreviewProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Collection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"aggregateFileCount"}},{"kind":"Field","name":{"kind":"Name","value":"previewFiles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageProps"}}]}}]}}]} as unknown as DocumentNode<CollectionsQueryQuery, CollectionsQueryQueryVariables>;
export const CollectionQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CollectionQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"collectionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"collectionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"directFileCount"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"CollectionPreviewProps"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewBase64"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CollectionPreviewProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Collection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"aggregateFileCount"}},{"kind":"Field","name":{"kind":"Name","value":"previewFiles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageProps"}}]}}]}}]} as unknown as DocumentNode<CollectionQueryQuery, CollectionQueryQueryVariables>;
export const FileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"File"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"file"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileLocationProps"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileTasksProps"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileExifProps"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageProps"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileLocationProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exifData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileTasksProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobStates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileExifProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exifData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cameraMake"}},{"kind":"Field","name":{"kind":"Name","value":"cameraModel"}},{"kind":"Field","name":{"kind":"Name","value":"lensModel"}},{"kind":"Field","name":{"kind":"Name","value":"lensMake"}},{"kind":"Field","name":{"kind":"Name","value":"dateTime"}},{"kind":"Field","name":{"kind":"Name","value":"exposureTime"}},{"kind":"Field","name":{"kind":"Name","value":"fNumber"}},{"kind":"Field","name":{"kind":"Name","value":"flash"}},{"kind":"Field","name":{"kind":"Name","value":"focalLength"}},{"kind":"Field","name":{"kind":"Name","value":"iso"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewBase64"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"width"}}]}}]}}]} as unknown as DocumentNode<FileQuery, FileQueryVariables>;
export const TasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Tasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"running"}},{"kind":"Field","name":{"kind":"Name","value":"nextRunAt"}}]}}]}}]} as unknown as DocumentNode<TasksQuery, TasksQueryVariables>;
export const RunTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RunTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"runTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nextRunAt"}},{"kind":"Field","name":{"kind":"Name","value":"running"}}]}}]}}]} as unknown as DocumentNode<RunTaskMutation, RunTaskMutationVariables>;