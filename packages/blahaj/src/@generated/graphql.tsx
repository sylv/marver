import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
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
  directory: Scalars['String']['output'];
  extension?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  info: FileInfoEmbeddable;
  media?: Maybe<Media>;
  mimeType?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  path: Scalars['String']['output'];
  tags: Array<FileTag>;
  type?: Maybe<FileType>;
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

export type FileInfoEmbeddable = {
  __typename?: 'FileInfoEmbeddable';
  corrupted: Scalars['Boolean']['output'];
  diskCreatedAt: Scalars['DateTime']['output'];
  diskModifiedAt: Scalars['DateTime']['output'];
  favourite: Scalars['Boolean']['output'];
  serverCheckedAt: Scalars['DateTime']['output'];
  serverCreatedAt: Scalars['DateTime']['output'];
  size: Scalars['Float']['output'];
  sizeFormatted: Scalars['String']['output'];
  unavailable: Scalars['Boolean']['output'];
};

export type FileTag = {
  __typename?: 'FileTag';
  system: Scalars['Boolean']['output'];
  tag: Tag;
};

export enum FileType {
  Image = 'Image',
  Video = 'Video'
}

export type Media = {
  __typename?: 'Media';
  audioChannels?: Maybe<Scalars['Float']['output']>;
  audioCodec?: Maybe<Scalars['String']['output']>;
  bitrate?: Maybe<Scalars['Float']['output']>;
  durationFormatted?: Maybe<Scalars['String']['output']>;
  durationSeconds?: Maybe<Scalars['Float']['output']>;
  exifData?: Maybe<MediaExifData>;
  faces: Array<Face>;
  file: File;
  framerate?: Maybe<Scalars['Float']['output']>;
  hasEmbeddedSubtitles?: Maybe<Scalars['Boolean']['output']>;
  hasFaces?: Maybe<Scalars['Boolean']['output']>;
  /** Whether text coudl be found in the image or video */
  hasText?: Maybe<Scalars['Boolean']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isAnimated?: Maybe<Scalars['Boolean']['output']>;
  /** Whether no subtitles could be generated from the audio on this video */
  nonVerbal?: Maybe<Scalars['Boolean']['output']>;
  poster: MediaPoster;
  previewBase64?: Maybe<Scalars['String']['output']>;
  similar: MediaConnection;
  subtitles: Array<MediaSubtitle>;
  texts: Array<MediaText>;
  thumbnail: MediaThumbnail;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  timeline: MediaTimeline;
  videoCodec?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};


export type MediaSimilarArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Float']['input']>;
  last?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  type?: InputMaybe<SimilarityType>;
};

export type MediaConnection = {
  __typename?: 'MediaConnection';
  edges: Array<MediaEdge>;
  pageInfo: PageInfo;
  /** Total number of MediaEntity items */
  totalCount: Scalars['Int']['output'];
};

/** Provides MediaEntity item and a cursor to its position */
export type MediaEdge = {
  __typename?: 'MediaEdge';
  /** The position of this MediaEntity item */
  cursor: Scalars['String']['output'];
  node: Media;
};

export type MediaExifData = {
  __typename?: 'MediaExifData';
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

export type MediaPoster = {
  __typename?: 'MediaPoster';
  height: Scalars['Float']['output'];
  mimeType: Scalars['String']['output'];
  width: Scalars['Float']['output'];
};

export enum MediaSort {
  DiskCreated = 'DiskCreated',
  Name = 'Name',
  Path = 'Path',
  Size = 'Size'
}

export enum MediaSortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type MediaSubtitle = {
  __typename?: 'MediaSubtitle';
  displayName: Scalars['String']['output'];
  forced: Scalars['Boolean']['output'];
  generated: Scalars['Boolean']['output'];
  hearingImpaired: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  languageIso639_1: Scalars['String']['output'];
  languageNameEnglish: Scalars['String']['output'];
  languageNameNative: Scalars['String']['output'];
  path: Scalars['String']['output'];
};

export type MediaText = {
  __typename?: 'MediaText';
  boundingBox: BoundingBox;
  code?: Maybe<Scalars['String']['output']>;
  confidence: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  text: Scalars['String']['output'];
  timestamp?: Maybe<Scalars['Float']['output']>;
  type: Scalars['Float']['output'];
};

export type MediaThumbnail = {
  __typename?: 'MediaThumbnail';
  height: Scalars['Float']['output'];
  mimeType: Scalars['String']['output'];
  width: Scalars['Float']['output'];
};

export type MediaTimeline = {
  __typename?: 'MediaTimeline';
  height: Scalars['Float']['output'];
  mimeType: Scalars['String']['output'];
  width: Scalars['Float']['output'];
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
  file?: Maybe<File>;
  files: FileConnection;
  media?: Maybe<Media>;
  mediaList: MediaConnection;
  tasks: Array<Task>;
};


export type QueryFileArgs = {
  id: Scalars['String']['input'];
};


export type QueryFilesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Float']['input']>;
  last?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMediaArgs = {
  id: Scalars['String']['input'];
};


export type QueryMediaListArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  afterDate?: InputMaybe<Scalars['DateTime']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  beforeDate?: InputMaybe<Scalars['DateTime']['input']>;
  direction?: InputMaybe<MediaSortDirection>;
  first?: InputMaybe<Scalars['Float']['input']>;
  last?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<MediaSort>;
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

export type MediaListQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type MediaListQuery = { __typename?: 'Query', mediaList: { __typename?: 'MediaConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string, endCursor: string }, edges: Array<{ __typename?: 'MediaEdge', node: { __typename?: 'Media', id?: string | null, previewBase64?: string | null, thumbnailUrl?: string | null, height?: number | null, width?: number | null, durationFormatted?: string | null, durationSeconds?: number | null, framerate?: number | null, videoCodec?: string | null, audioCodec?: string | null, file: { __typename?: 'File', id: string, path: string, name: string, info: { __typename?: 'FileInfoEmbeddable', diskCreatedAt: any, size: number, sizeFormatted: string } }, faces: Array<{ __typename?: 'Face', id: string, boundingBox: { __typename?: 'BoundingBox', x1: number, y1: number, x2: number, y2: number } }> } }> } };

export type MinimalMediaFragment = { __typename?: 'Media', id?: string | null, previewBase64?: string | null, thumbnailUrl?: string | null, height?: number | null, width?: number | null, durationFormatted?: string | null, durationSeconds?: number | null, framerate?: number | null, videoCodec?: string | null, audioCodec?: string | null, file: { __typename?: 'File', id: string, path: string, name: string, info: { __typename?: 'FileInfoEmbeddable', size: number, sizeFormatted: string } }, faces: Array<{ __typename?: 'Face', id: string, boundingBox: { __typename?: 'BoundingBox', x1: number, y1: number, x2: number, y2: number } }> };

export type BoundingBoxFragment = { __typename?: 'BoundingBox', x1: number, y1: number, x2: number, y2: number };

export type GetMediaQueryVariables = Exact<{
  fileId: Scalars['String']['input'];
  filter?: InputMaybe<SimilarityType>;
}>;


export type GetMediaQuery = { __typename?: 'Query', media?: { __typename?: 'Media', id?: string | null, previewBase64?: string | null, thumbnailUrl?: string | null, height?: number | null, width?: number | null, durationFormatted?: string | null, durationSeconds?: number | null, framerate?: number | null, videoCodec?: string | null, audioCodec?: string | null, subtitles: Array<{ __typename?: 'MediaSubtitle', id: string, displayName: string, forced: boolean, hearingImpaired: boolean, generated: boolean }>, file: { __typename?: 'File', type?: FileType | null, id: string, path: string, name: string, info: { __typename?: 'FileInfoEmbeddable', size: number, sizeFormatted: string } }, faces: Array<{ __typename?: 'Face', id: string, boundingBox: { __typename?: 'BoundingBox', x1: number, y1: number, x2: number, y2: number }, person?: { __typename?: 'Person', id: string, name: string } | null }>, texts: Array<{ __typename?: 'MediaText', id: string, text: string, code?: string | null, boundingBox: { __typename?: 'BoundingBox', x1: number, y1: number, x2: number, y2: number } }>, similar: { __typename?: 'MediaConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string, endCursor: string }, edges: Array<{ __typename?: 'MediaEdge', node: { __typename?: 'Media', id?: string | null, previewBase64?: string | null, thumbnailUrl?: string | null, height?: number | null, width?: number | null, durationFormatted?: string | null, durationSeconds?: number | null, framerate?: number | null, videoCodec?: string | null, audioCodec?: string | null, file: { __typename?: 'File', id: string, path: string, name: string, info: { __typename?: 'FileInfoEmbeddable', size: number, sizeFormatted: string } }, faces: Array<{ __typename?: 'Face', id: string, boundingBox: { __typename?: 'BoundingBox', x1: number, y1: number, x2: number, y2: number } }> } }> } } | null };

export type TasksQueryVariables = Exact<{ [key: string]: never; }>;


export type TasksQuery = { __typename?: 'Query', tasks: Array<{ __typename?: 'Task', id: string, name: string, description?: string | null, running?: boolean | null, nextRunAt: number }> };

export type RunTaskMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RunTaskMutation = { __typename?: 'Mutation', runTask: { __typename?: 'Task', id: string, name: string, description?: string | null, running?: boolean | null, nextRunAt: number } };

export type RegularTaskFragment = { __typename?: 'Task', id: string, name: string, description?: string | null, running?: boolean | null, nextRunAt: number };

export const BoundingBoxFragmentDoc = gql`
    fragment BoundingBox on BoundingBox {
  x1
  y1
  x2
  y2
}
    `;
export const MinimalMediaFragmentDoc = gql`
    fragment MinimalMedia on Media {
  id
  previewBase64
  thumbnailUrl
  height
  width
  durationFormatted
  durationSeconds
  framerate
  videoCodec
  audioCodec
  file {
    id
    path
    name
    info {
      size
      sizeFormatted
    }
  }
  faces {
    id
    boundingBox {
      ...BoundingBox
    }
  }
}
    ${BoundingBoxFragmentDoc}`;
export const RegularTaskFragmentDoc = gql`
    fragment RegularTask on Task {
  id
  name
  description
  running
  nextRunAt
}
    `;
export const MediaListDocument = gql`
    query MediaList($search: String, $after: String) {
  mediaList(search: $search, after: $after, first: 50) {
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    edges {
      node {
        ...MinimalMedia
        file {
          info {
            diskCreatedAt
          }
        }
      }
    }
  }
}
    ${MinimalMediaFragmentDoc}`;

/**
 * __useMediaListQuery__
 *
 * To run a query within a React component, call `useMediaListQuery` and pass it any options that fit your needs.
 * When your component renders, `useMediaListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMediaListQuery({
 *   variables: {
 *      search: // value for 'search'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useMediaListQuery(baseOptions?: Apollo.QueryHookOptions<MediaListQuery, MediaListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MediaListQuery, MediaListQueryVariables>(MediaListDocument, options);
      }
export function useMediaListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MediaListQuery, MediaListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MediaListQuery, MediaListQueryVariables>(MediaListDocument, options);
        }
export type MediaListQueryHookResult = ReturnType<typeof useMediaListQuery>;
export type MediaListLazyQueryHookResult = ReturnType<typeof useMediaListLazyQuery>;
export type MediaListQueryResult = Apollo.QueryResult<MediaListQuery, MediaListQueryVariables>;
export const GetMediaDocument = gql`
    query GetMedia($fileId: String!, $filter: SimilarityType) {
  media(id: $fileId) {
    ...MinimalMedia
    subtitles {
      id
      displayName
      forced
      hearingImpaired
      generated
    }
    file {
      type
    }
    faces {
      id
      boundingBox {
        x1
        y1
        x2
        y2
      }
      person {
        id
        name
      }
    }
    texts {
      id
      text
      code
      boundingBox {
        x1
        y1
        x2
        y2
      }
    }
    similar(type: $filter) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          ...MinimalMedia
        }
      }
    }
  }
}
    ${MinimalMediaFragmentDoc}`;

/**
 * __useGetMediaQuery__
 *
 * To run a query within a React component, call `useGetMediaQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMediaQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMediaQuery({
 *   variables: {
 *      fileId: // value for 'fileId'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetMediaQuery(baseOptions: Apollo.QueryHookOptions<GetMediaQuery, GetMediaQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMediaQuery, GetMediaQueryVariables>(GetMediaDocument, options);
      }
export function useGetMediaLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMediaQuery, GetMediaQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMediaQuery, GetMediaQueryVariables>(GetMediaDocument, options);
        }
export type GetMediaQueryHookResult = ReturnType<typeof useGetMediaQuery>;
export type GetMediaLazyQueryHookResult = ReturnType<typeof useGetMediaLazyQuery>;
export type GetMediaQueryResult = Apollo.QueryResult<GetMediaQuery, GetMediaQueryVariables>;
export const TasksDocument = gql`
    query Tasks {
  tasks {
    ...RegularTask
  }
}
    ${RegularTaskFragmentDoc}`;

/**
 * __useTasksQuery__
 *
 * To run a query within a React component, call `useTasksQuery` and pass it any options that fit your needs.
 * When your component renders, `useTasksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTasksQuery({
 *   variables: {
 *   },
 * });
 */
export function useTasksQuery(baseOptions?: Apollo.QueryHookOptions<TasksQuery, TasksQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TasksQuery, TasksQueryVariables>(TasksDocument, options);
      }
export function useTasksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TasksQuery, TasksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TasksQuery, TasksQueryVariables>(TasksDocument, options);
        }
export type TasksQueryHookResult = ReturnType<typeof useTasksQuery>;
export type TasksLazyQueryHookResult = ReturnType<typeof useTasksLazyQuery>;
export type TasksQueryResult = Apollo.QueryResult<TasksQuery, TasksQueryVariables>;
export const RunTaskDocument = gql`
    mutation RunTask($id: ID!) {
  runTask(id: $id) {
    ...RegularTask
  }
}
    ${RegularTaskFragmentDoc}`;
export type RunTaskMutationFn = Apollo.MutationFunction<RunTaskMutation, RunTaskMutationVariables>;

/**
 * __useRunTaskMutation__
 *
 * To run a mutation, you first call `useRunTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRunTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [runTaskMutation, { data, loading, error }] = useRunTaskMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRunTaskMutation(baseOptions?: Apollo.MutationHookOptions<RunTaskMutation, RunTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RunTaskMutation, RunTaskMutationVariables>(RunTaskDocument, options);
      }
export type RunTaskMutationHookResult = ReturnType<typeof useRunTaskMutation>;
export type RunTaskMutationResult = Apollo.MutationResult<RunTaskMutation>;
export type RunTaskMutationOptions = Apollo.BaseMutationOptions<RunTaskMutation, RunTaskMutationVariables>;