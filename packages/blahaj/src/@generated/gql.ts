
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
    "\n  fragment CollectionPreviewProps on Collection {\n    id\n    name\n    description\n    aggregateFileCount\n    previewFiles {\n      id\n      thumbnailUrl\n      info {\n        height\n        width\n      }\n      ...ImageProps\n    }\n  }\n": types.CollectionPreviewPropsFragmentDoc,
    "\n  query Files($search: String, $after: String, $first: Float, $collectionId: ID) {\n    files(search: $search, after: $after, first: $first, collectionId: $collectionId) {\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      edges {\n        node {\n          id\n          thumbnailUrl\n          info {\n            height\n            width\n          }\n          ...FilePreviewProps\n        }\n      }\n    }\n  }\n": types.FilesDocument,
    "\n  fragment FilePreviewProps on File {\n    id\n    name\n    info {\n      durationFormatted\n    }\n    ...ImageProps\n  }\n": types.FilePreviewPropsFragmentDoc,
    "\n  fragment FileExifProps on File {\n    exifData {\n      cameraMake\n      cameraModel\n      lensModel\n      lensMake\n      dateTime\n      exposureTime\n      fNumber\n      flash\n      focalLength\n      iso\n    }\n  }\n": types.FileExifPropsFragmentDoc,
    "\n  fragment FileLocationProps on File {\n    exifData {\n      longitude\n      latitude\n    }\n  }\n": types.FileLocationPropsFragmentDoc,
    "\n  fragment FileTasksProps on File {\n    jobStates {\n      state\n      type\n    }\n  }\n": types.FileTasksPropsFragmentDoc,
    "\n  fragment ImageProps on File {\n    name\n    thumbnailUrl\n    previewBase64\n    info {\n      height\n      width\n    }\n  }\n": types.ImagePropsFragmentDoc,
    "\n  query CollectionsQuery {\n    collections {\n      id\n      ...CollectionPreviewProps\n    }\n  }\n": types.CollectionsQueryDocument,
    "\n  query CollectionQuery($collectionId: String!) {\n    collection(id: $collectionId) {\n      id\n      name\n      description\n      directFileCount\n      parent {\n        id\n        name\n      }\n      children {\n        id\n        ...CollectionPreviewProps\n      }\n    }\n  }\n": types.CollectionQueryDocument,
    "\n  query File($fileId: String!) {\n    file(id: $fileId) {\n      id\n      name\n      type\n      thumbnailUrl\n      info {\n        height\n        width\n        durationSeconds\n      }\n      ...FileLocationProps\n      ...FileTasksProps\n      ...FileExifProps\n      ...ImageProps\n    }\n  }\n": types.FileDocument,
    "\n  query Tasks {\n    tasks {\n      id\n      name\n      description\n      running\n      nextRunAt\n    }\n  }\n": types.TasksDocument,
    "\n  mutation RunTask($id: ID!) {\n    runTask(id: $id) {\n      id\n      nextRunAt\n      running\n    }\n  }\n": types.RunTaskDocument,
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
export function graphql(source: "\n  fragment CollectionPreviewProps on Collection {\n    id\n    name\n    description\n    aggregateFileCount\n    previewFiles {\n      id\n      thumbnailUrl\n      info {\n        height\n        width\n      }\n      ...ImageProps\n    }\n  }\n"): (typeof documents)["\n  fragment CollectionPreviewProps on Collection {\n    id\n    name\n    description\n    aggregateFileCount\n    previewFiles {\n      id\n      thumbnailUrl\n      info {\n        height\n        width\n      }\n      ...ImageProps\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Files($search: String, $after: String, $first: Float, $collectionId: ID) {\n    files(search: $search, after: $after, first: $first, collectionId: $collectionId) {\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      edges {\n        node {\n          id\n          thumbnailUrl\n          info {\n            height\n            width\n          }\n          ...FilePreviewProps\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Files($search: String, $after: String, $first: Float, $collectionId: ID) {\n    files(search: $search, after: $after, first: $first, collectionId: $collectionId) {\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      edges {\n        node {\n          id\n          thumbnailUrl\n          info {\n            height\n            width\n          }\n          ...FilePreviewProps\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment FilePreviewProps on File {\n    id\n    name\n    info {\n      durationFormatted\n    }\n    ...ImageProps\n  }\n"): (typeof documents)["\n  fragment FilePreviewProps on File {\n    id\n    name\n    info {\n      durationFormatted\n    }\n    ...ImageProps\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment FileExifProps on File {\n    exifData {\n      cameraMake\n      cameraModel\n      lensModel\n      lensMake\n      dateTime\n      exposureTime\n      fNumber\n      flash\n      focalLength\n      iso\n    }\n  }\n"): (typeof documents)["\n  fragment FileExifProps on File {\n    exifData {\n      cameraMake\n      cameraModel\n      lensModel\n      lensMake\n      dateTime\n      exposureTime\n      fNumber\n      flash\n      focalLength\n      iso\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment FileLocationProps on File {\n    exifData {\n      longitude\n      latitude\n    }\n  }\n"): (typeof documents)["\n  fragment FileLocationProps on File {\n    exifData {\n      longitude\n      latitude\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment FileTasksProps on File {\n    jobStates {\n      state\n      type\n    }\n  }\n"): (typeof documents)["\n  fragment FileTasksProps on File {\n    jobStates {\n      state\n      type\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ImageProps on File {\n    name\n    thumbnailUrl\n    previewBase64\n    info {\n      height\n      width\n    }\n  }\n"): (typeof documents)["\n  fragment ImageProps on File {\n    name\n    thumbnailUrl\n    previewBase64\n    info {\n      height\n      width\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CollectionsQuery {\n    collections {\n      id\n      ...CollectionPreviewProps\n    }\n  }\n"): (typeof documents)["\n  query CollectionsQuery {\n    collections {\n      id\n      ...CollectionPreviewProps\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CollectionQuery($collectionId: String!) {\n    collection(id: $collectionId) {\n      id\n      name\n      description\n      directFileCount\n      parent {\n        id\n        name\n      }\n      children {\n        id\n        ...CollectionPreviewProps\n      }\n    }\n  }\n"): (typeof documents)["\n  query CollectionQuery($collectionId: String!) {\n    collection(id: $collectionId) {\n      id\n      name\n      description\n      directFileCount\n      parent {\n        id\n        name\n      }\n      children {\n        id\n        ...CollectionPreviewProps\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query File($fileId: String!) {\n    file(id: $fileId) {\n      id\n      name\n      type\n      thumbnailUrl\n      info {\n        height\n        width\n        durationSeconds\n      }\n      ...FileLocationProps\n      ...FileTasksProps\n      ...FileExifProps\n      ...ImageProps\n    }\n  }\n"): (typeof documents)["\n  query File($fileId: String!) {\n    file(id: $fileId) {\n      id\n      name\n      type\n      thumbnailUrl\n      info {\n        height\n        width\n        durationSeconds\n      }\n      ...FileLocationProps\n      ...FileTasksProps\n      ...FileExifProps\n      ...ImageProps\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Tasks {\n    tasks {\n      id\n      name\n      description\n      running\n      nextRunAt\n    }\n  }\n"): (typeof documents)["\n  query Tasks {\n    tasks {\n      id\n      name\n      description\n      running\n      nextRunAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RunTask($id: ID!) {\n    runTask(id: $id) {\n      id\n      nextRunAt\n      running\n    }\n  }\n"): (typeof documents)["\n  mutation RunTask($id: ID!) {\n    runTask(id: $id) {\n      id\n      nextRunAt\n      running\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;