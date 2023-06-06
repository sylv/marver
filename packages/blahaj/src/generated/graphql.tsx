import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: any;
};

export type BoundingBox = {
  __typename?: 'BoundingBox';
  x1: Scalars['Float'];
  x2: Scalars['Float'];
  y1: Scalars['Float'];
  y2: Scalars['Float'];
};

export type Face = {
  __typename?: 'Face';
  boundingBox: BoundingBox;
  id: Scalars['ID'];
  person?: Maybe<Person>;
};

export type File = {
  __typename?: 'File';
  directory: Scalars['String'];
  extension?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  media?: Maybe<Media>;
  metadata: FileMetadata;
  mimeType?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  path: Scalars['String'];
  tags: Array<FileTag>;
  type?: Maybe<FileType>;
};

export type FileConnection = {
  __typename?: 'FileConnection';
  edges: Array<FileEdge>;
  pageInfo: PageInfo;
  /** Total number of File items */
  totalCount: Scalars['Int'];
};

/** Provides File item and a cursor to its position */
export type FileEdge = {
  __typename?: 'FileEdge';
  /** The position of this File item */
  cursor: Scalars['String'];
  node: File;
};

export type FileMetadata = {
  __typename?: 'FileMetadata';
  corrupted: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  diskCreatedAt: Scalars['DateTime'];
  diskModifiedAt: Scalars['DateTime'];
  favourite: Scalars['Boolean'];
  serverCheckedAt: Scalars['DateTime'];
  serverCreatedAt: Scalars['DateTime'];
  size: Scalars['Float'];
  sizeFormatted: Scalars['String'];
  unavailable: Scalars['Boolean'];
};

export type FileTag = {
  __typename?: 'FileTag';
  system: Scalars['Boolean'];
  tag: Tag;
};

export enum FileType {
  Image = 'Image',
  Video = 'Video'
}

export type Media = {
  __typename?: 'Media';
  audioChannels?: Maybe<Scalars['Float']>;
  audioCodec?: Maybe<Scalars['String']>;
  bitrate?: Maybe<Scalars['Float']>;
  durationFormatted?: Maybe<Scalars['String']>;
  durationSeconds?: Maybe<Scalars['Float']>;
  exifMetadata?: Maybe<MediaExifData>;
  faces: Array<Face>;
  file: File;
  framerate?: Maybe<Scalars['Float']>;
  hasEmbeddedSubtitles?: Maybe<Scalars['Boolean']>;
  hasFaces?: Maybe<Scalars['Boolean']>;
  height?: Maybe<Scalars['Float']>;
  isAnimated?: Maybe<Scalars['Boolean']>;
  /** Whether no subtitles could be generated from the audio on this video */
  nonVerbal?: Maybe<Scalars['Boolean']>;
  poster: MediaPoster;
  previewBase64?: Maybe<Scalars['String']>;
  similar: MediaConnection;
  subtitles: Array<MediaSubtitle>;
  thumbnail: MediaThumbnail;
  thumbnailUrl?: Maybe<Scalars['String']>;
  timeline: MediaTimeline;
  videoCodec?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['Float']>;
};


export type MediaSimilarArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  offset?: InputMaybe<Scalars['Float']>;
  type?: InputMaybe<SimilarityType>;
};

export type MediaConnection = {
  __typename?: 'MediaConnection';
  edges: Array<MediaEdge>;
  pageInfo: PageInfo;
  /** Total number of Media items */
  totalCount: Scalars['Int'];
};

/** Provides Media item and a cursor to its position */
export type MediaEdge = {
  __typename?: 'MediaEdge';
  /** The position of this Media item */
  cursor: Scalars['String'];
  node: Media;
};

export type MediaExifData = {
  __typename?: 'MediaExifData';
  cameraMake?: Maybe<Scalars['String']>;
  cameraModel?: Maybe<Scalars['String']>;
  dateTime?: Maybe<Scalars['DateTime']>;
  exposureTime?: Maybe<Scalars['String']>;
  fNumber?: Maybe<Scalars['String']>;
  flash?: Maybe<Scalars['String']>;
  focalLength?: Maybe<Scalars['String']>;
  iso?: Maybe<Scalars['Float']>;
  latitude?: Maybe<Scalars['Float']>;
  lensMake?: Maybe<Scalars['String']>;
  lensModel?: Maybe<Scalars['String']>;
  longitude?: Maybe<Scalars['Float']>;
};

export type MediaPoster = {
  __typename?: 'MediaPoster';
  height: Scalars['Float'];
  mimeType: Scalars['String'];
  width: Scalars['Float'];
};

export type MediaSubtitle = {
  __typename?: 'MediaSubtitle';
  displayName: Scalars['String'];
  forced: Scalars['Boolean'];
  generated: Scalars['Boolean'];
  hearingImpaired: Scalars['Boolean'];
  id: Scalars['ID'];
  languageIso639_1: Scalars['String'];
  languageNameEnglish: Scalars['String'];
  languageNameNative: Scalars['String'];
  path: Scalars['String'];
};

export type MediaThumbnail = {
  __typename?: 'MediaThumbnail';
  height: Scalars['Float'];
  mimeType: Scalars['String'];
  width: Scalars['Float'];
};

export type MediaTimeline = {
  __typename?: 'MediaTimeline';
  height: Scalars['Float'];
  mimeType: Scalars['String'];
  width: Scalars['Float'];
};

/** Provides info abou the current page */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** Cursor referencing the end of the page */
  endCursor: Scalars['String'];
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  /** Cursor referencing the beginning of the page */
  startCursor: Scalars['String'];
};

export type Person = {
  __typename?: 'Person';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  file?: Maybe<File>;
  files: FileConnection;
  media?: Maybe<Media>;
  mediaList: MediaConnection;
};


export type QueryFileArgs = {
  id: Scalars['String'];
};


export type QueryFilesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  offset?: InputMaybe<Scalars['Float']>;
  search?: InputMaybe<Scalars['String']>;
};


export type QueryMediaArgs = {
  id: Scalars['String'];
};


export type QueryMediaListArgs = {
  after?: InputMaybe<Scalars['String']>;
  afterDate?: InputMaybe<Scalars['DateTime']>;
  before?: InputMaybe<Scalars['String']>;
  beforeDate?: InputMaybe<Scalars['DateTime']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  offset?: InputMaybe<Scalars['Float']>;
  search?: InputMaybe<Scalars['String']>;
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
  name: Scalars['ID'];
};

export type GetMediaListQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
}>;


export type GetMediaListQuery = { __typename?: 'Query', mediaList: { __typename?: 'MediaConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string, endCursor: string }, edges: Array<{ __typename?: 'MediaEdge', node: { __typename?: 'Media', previewBase64?: string | null, thumbnailUrl?: string | null, height?: number | null, width?: number | null, durationFormatted?: string | null, framerate?: number | null, videoCodec?: string | null, audioCodec?: string | null, file: { __typename?: 'File', id: string, path: string, name: string, metadata: { __typename?: 'FileMetadata', createdAt: any, size: number, sizeFormatted: string } } } }> } };

export type MinimalMediaFragment = { __typename?: 'Media', previewBase64?: string | null, thumbnailUrl?: string | null, height?: number | null, width?: number | null, durationFormatted?: string | null, framerate?: number | null, videoCodec?: string | null, audioCodec?: string | null, file: { __typename?: 'File', id: string, path: string, name: string, metadata: { __typename?: 'FileMetadata', size: number, sizeFormatted: string } } };

export type GetMediaQueryVariables = Exact<{
  fileId: Scalars['String'];
  filter?: InputMaybe<SimilarityType>;
}>;


export type GetMediaQuery = { __typename?: 'Query', media?: { __typename?: 'Media', previewBase64?: string | null, thumbnailUrl?: string | null, height?: number | null, width?: number | null, durationFormatted?: string | null, framerate?: number | null, videoCodec?: string | null, audioCodec?: string | null, subtitles: Array<{ __typename?: 'MediaSubtitle', id: string, displayName: string, forced: boolean, hearingImpaired: boolean, generated: boolean }>, file: { __typename?: 'File', type?: FileType | null, id: string, path: string, name: string, metadata: { __typename?: 'FileMetadata', size: number, sizeFormatted: string } }, faces: Array<{ __typename?: 'Face', id: string, boundingBox: { __typename?: 'BoundingBox', x1: number, y1: number, x2: number, y2: number }, person?: { __typename?: 'Person', id: string, name: string } | null }>, similar: { __typename?: 'MediaConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string, endCursor: string }, edges: Array<{ __typename?: 'MediaEdge', node: { __typename?: 'Media', previewBase64?: string | null, thumbnailUrl?: string | null, height?: number | null, width?: number | null, durationFormatted?: string | null, framerate?: number | null, videoCodec?: string | null, audioCodec?: string | null, file: { __typename?: 'File', id: string, path: string, name: string, metadata: { __typename?: 'FileMetadata', size: number, sizeFormatted: string } } } }> } } | null };

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
    ${MinimalMediaFragmentDoc}`;

export function useGetMediaListQuery(options?: Omit<Urql.UseQueryArgs<GetMediaListQueryVariables>, 'query'>) {
  return Urql.useQuery<GetMediaListQuery, GetMediaListQueryVariables>({ query: GetMediaListDocument, ...options });
};
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

export function useGetMediaQuery(options: Omit<Urql.UseQueryArgs<GetMediaQueryVariables>, 'query'>) {
  return Urql.useQuery<GetMediaQuery, GetMediaQueryVariables>({ query: GetMediaDocument, ...options });
};