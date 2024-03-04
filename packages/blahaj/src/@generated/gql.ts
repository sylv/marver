/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "query File($fileId: String!, $filter: SimilarityType) {\n  file(id: $fileId) {\n    ...FullFile\n  }\n}\n\nfragment FullFile on File {\n  ...FileParts\n  type\n  jobStates {\n    type\n    state\n    executedAt\n    errorMessage\n    retryAfter\n  }\n  exifData {\n    ...ExifPart\n  }\n  similar(type: $filter) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      hasPreviousPage\n      startCursor\n      endCursor\n    }\n    edges {\n      node {\n        ...FileParts\n      }\n    }\n  }\n}\n\nfragment ExifPart on FileExifData {\n  cameraMake\n  cameraModel\n  lensModel\n  lensMake\n  dateTime\n  exposureTime\n  fNumber\n  flash\n  focalLength\n  iso\n  latitude\n  longitude\n}": types.FileDocument,
    "query Files($search: String, $after: String, $first: Float) {\n  files(search: $search, after: $after, first: $first) {\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    edges {\n      node {\n        ...FileParts\n      }\n    }\n  }\n}\n\nfragment FileParts on File {\n  id\n  previewBase64\n  thumbnailUrl\n  path\n  name\n  size\n  sizeFormatted\n  info {\n    height\n    width\n    durationFormatted\n    durationSeconds\n    framerate\n    videoCodec\n    audioCodec\n  }\n}": types.FilesDocument,
    "query Tasks {\n  tasks {\n    ...TaskParts\n  }\n}\n\nmutation RunTask($id: ID!) {\n  runTask(id: $id) {\n    ...TaskParts\n  }\n}\n\nfragment TaskParts on Task {\n  id\n  name\n  description\n  running\n  nextRunAt\n}": types.TasksDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query File($fileId: String!, $filter: SimilarityType) {\n  file(id: $fileId) {\n    ...FullFile\n  }\n}\n\nfragment FullFile on File {\n  ...FileParts\n  type\n  jobStates {\n    type\n    state\n    executedAt\n    errorMessage\n    retryAfter\n  }\n  exifData {\n    ...ExifPart\n  }\n  similar(type: $filter) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      hasPreviousPage\n      startCursor\n      endCursor\n    }\n    edges {\n      node {\n        ...FileParts\n      }\n    }\n  }\n}\n\nfragment ExifPart on FileExifData {\n  cameraMake\n  cameraModel\n  lensModel\n  lensMake\n  dateTime\n  exposureTime\n  fNumber\n  flash\n  focalLength\n  iso\n  latitude\n  longitude\n}"): (typeof documents)["query File($fileId: String!, $filter: SimilarityType) {\n  file(id: $fileId) {\n    ...FullFile\n  }\n}\n\nfragment FullFile on File {\n  ...FileParts\n  type\n  jobStates {\n    type\n    state\n    executedAt\n    errorMessage\n    retryAfter\n  }\n  exifData {\n    ...ExifPart\n  }\n  similar(type: $filter) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      hasPreviousPage\n      startCursor\n      endCursor\n    }\n    edges {\n      node {\n        ...FileParts\n      }\n    }\n  }\n}\n\nfragment ExifPart on FileExifData {\n  cameraMake\n  cameraModel\n  lensModel\n  lensMake\n  dateTime\n  exposureTime\n  fNumber\n  flash\n  focalLength\n  iso\n  latitude\n  longitude\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Files($search: String, $after: String, $first: Float) {\n  files(search: $search, after: $after, first: $first) {\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    edges {\n      node {\n        ...FileParts\n      }\n    }\n  }\n}\n\nfragment FileParts on File {\n  id\n  previewBase64\n  thumbnailUrl\n  path\n  name\n  size\n  sizeFormatted\n  info {\n    height\n    width\n    durationFormatted\n    durationSeconds\n    framerate\n    videoCodec\n    audioCodec\n  }\n}"): (typeof documents)["query Files($search: String, $after: String, $first: Float) {\n  files(search: $search, after: $after, first: $first) {\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    edges {\n      node {\n        ...FileParts\n      }\n    }\n  }\n}\n\nfragment FileParts on File {\n  id\n  previewBase64\n  thumbnailUrl\n  path\n  name\n  size\n  sizeFormatted\n  info {\n    height\n    width\n    durationFormatted\n    durationSeconds\n    framerate\n    videoCodec\n    audioCodec\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Tasks {\n  tasks {\n    ...TaskParts\n  }\n}\n\nmutation RunTask($id: ID!) {\n  runTask(id: $id) {\n    ...TaskParts\n  }\n}\n\nfragment TaskParts on Task {\n  id\n  name\n  description\n  running\n  nextRunAt\n}"): (typeof documents)["query Tasks {\n  tasks {\n    ...TaskParts\n  }\n}\n\nmutation RunTask($id: ID!) {\n  runTask(id: $id) {\n    ...TaskParts\n  }\n}\n\nfragment TaskParts on Task {\n  id\n  name\n  description\n  running\n  nextRunAt\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;