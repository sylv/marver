import gql from 'graphql-tag';
import * as Urql from 'urql';

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any };
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
  media?: Maybe<Media>;
  metadata: FileMetadata;
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
  /** Total number of File items */
  totalCount: Scalars['Int']['output'];
};

/** Provides File item and a cursor to its position */
export type FileEdge = {
  __typename?: 'FileEdge';
  /** The position of this File item */
  cursor: Scalars['String']['output'];
  node: File;
};

export type FileMetadata = {
  __typename?: 'FileMetadata';
  corrupted: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
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
  Video = 'Video',
}

export type Media = {
  __typename?: 'Media';
  audioChannels?: Maybe<Scalars['Float']['output']>;
  audioCodec?: Maybe<Scalars['String']['output']>;
  bitrate?: Maybe<Scalars['Float']['output']>;
  durationFormatted?: Maybe<Scalars['String']['output']>;
  durationSeconds?: Maybe<Scalars['Float']['output']>;
  exifMetadata?: Maybe<MediaExifData>;
  faces: Array<Face>;
  file: File;
  framerate?: Maybe<Scalars['Float']['output']>;
  hasEmbeddedSubtitles?: Maybe<Scalars['Boolean']['output']>;
  hasFaces?: Maybe<Scalars['Boolean']['output']>;
  /** Whether text coudl be found in the image or video */
  hasText?: Maybe<Scalars['Boolean']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
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
  /** Total number of Media items */
  totalCount: Scalars['Int']['output'];
};

/** Provides Media item and a cursor to its position */
export type MediaEdge = {
  __typename?: 'MediaEdge';
  /** The position of this Media item */
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
  id: Scalars['Float']['output'];
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
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  file?: Maybe<File>;
  files: FileConnection;
  media?: Maybe<Media>;
  mediaList: MediaConnection;
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
  first?: InputMaybe<Scalars['Float']['input']>;
  last?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export enum SimilarityType {
  Images = 'Images',
  Related = 'Related',
  SameFolder = 'SameFolder',
  SameType = 'SameType',
  Similar = 'Similar',
  Videos = 'Videos',
}

export type Tag = {
  __typename?: 'Tag';
  name: Scalars['ID']['output'];
};

export type GetMediaListQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type GetMediaListQuery = {
  __typename?: 'Query';
  mediaList: {
    __typename?: 'MediaConnection';
    totalCount: number;
    pageInfo: {
      __typename?: 'PageInfo';
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
    edges: Array<{
      __typename?: 'MediaEdge';
      node: {
        __typename?: 'Media';
        previewBase64?: string | null;
        thumbnailUrl?: string | null;
        height?: number | null;
        width?: number | null;
        durationFormatted?: string | null;
        framerate?: number | null;
        videoCodec?: string | null;
        audioCodec?: string | null;
        file: {
          __typename?: 'File';
          id: string;
          path: string;
          name: string;
          metadata: { __typename?: 'FileMetadata'; createdAt: any; size: number; sizeFormatted: string };
        };
      };
    }>;
  };
};

export type MinimalMediaFragment = {
  __typename?: 'Media';
  previewBase64?: string | null;
  thumbnailUrl?: string | null;
  height?: number | null;
  width?: number | null;
  durationFormatted?: string | null;
  framerate?: number | null;
  videoCodec?: string | null;
  audioCodec?: string | null;
  file: {
    __typename?: 'File';
    id: string;
    path: string;
    name: string;
    metadata: { __typename?: 'FileMetadata'; size: number; sizeFormatted: string };
  };
};

export type GetMediaQueryVariables = Exact<{
  fileId: Scalars['String']['input'];
  filter?: InputMaybe<SimilarityType>;
}>;

export type GetMediaQuery = {
  __typename?: 'Query';
  media?: {
    __typename?: 'Media';
    previewBase64?: string | null;
    thumbnailUrl?: string | null;
    height?: number | null;
    width?: number | null;
    durationFormatted?: string | null;
    framerate?: number | null;
    videoCodec?: string | null;
    audioCodec?: string | null;
    subtitles: Array<{
      __typename?: 'MediaSubtitle';
      id: string;
      displayName: string;
      forced: boolean;
      hearingImpaired: boolean;
      generated: boolean;
    }>;
    file: {
      __typename?: 'File';
      type?: FileType | null;
      id: string;
      path: string;
      name: string;
      metadata: { __typename?: 'FileMetadata'; size: number; sizeFormatted: string };
    };
    faces: Array<{
      __typename?: 'Face';
      id: string;
      boundingBox: { __typename?: 'BoundingBox'; x1: number; y1: number; x2: number; y2: number };
      person?: { __typename?: 'Person'; id: string; name: string } | null;
    }>;
    texts: Array<{
      __typename?: 'MediaText';
      id: number;
      text: string;
      code?: string | null;
      boundingBox: { __typename?: 'BoundingBox'; x1: number; y1: number; x2: number; y2: number };
    }>;
    similar: {
      __typename?: 'MediaConnection';
      totalCount: number;
      pageInfo: {
        __typename?: 'PageInfo';
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string;
        endCursor: string;
      };
      edges: Array<{
        __typename?: 'MediaEdge';
        node: {
          __typename?: 'Media';
          previewBase64?: string | null;
          thumbnailUrl?: string | null;
          height?: number | null;
          width?: number | null;
          durationFormatted?: string | null;
          framerate?: number | null;
          videoCodec?: string | null;
          audioCodec?: string | null;
          file: {
            __typename?: 'File';
            id: string;
            path: string;
            name: string;
            metadata: { __typename?: 'FileMetadata'; size: number; sizeFormatted: string };
          };
        };
      }>;
    };
  } | null;
};

export const MinimalMediaFragmentDoc = gql`
  fragment MinimalMedia on Media {
    previewBase64
    thumbnailUrl
    height
    width
    durationFormatted
    framerate
    videoCodec
    audioCodec
    file {
      id
      path
      name
      metadata {
        size
        sizeFormatted
      }
    }
  }
`;
export const GetMediaListDocument = gql`
  query GetMediaList($search: String, $after: String) {
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
            metadata {
              createdAt
            }
          }
        }
      }
    }
  }
  ${MinimalMediaFragmentDoc}
`;

export function useGetMediaListQuery(options?: Omit<Urql.UseQueryArgs<GetMediaListQueryVariables>, 'query'>) {
  return Urql.useQuery<GetMediaListQuery, GetMediaListQueryVariables>({
    query: GetMediaListDocument,
    ...options,
  });
}
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
  ${MinimalMediaFragmentDoc}
`;

export function useGetMediaQuery(options: Omit<Urql.UseQueryArgs<GetMediaQueryVariables>, 'query'>) {
  return Urql.useQuery<GetMediaQuery, GetMediaQueryVariables>({ query: GetMediaDocument, ...options });
}
