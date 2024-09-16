/* eslint-disable */
/* prettier-ignore */

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
  name: never;
  query: "Query";
  mutation: "Mutation";
  subscription: never;
  types: {
    Boolean: unknown;
    Collection: {
      kind: "OBJECT";
      name: "Collection";
      fields: {
        aggregateFileCount: {
          name: "aggregateFileCount";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Float"; ofType: null } };
        };
        children: {
          name: "children";
          type: {
            kind: "NON_NULL";
            name: never;
            ofType: {
              kind: "LIST";
              name: never;
              ofType: {
                kind: "NON_NULL";
                name: never;
                ofType: { kind: "OBJECT"; name: "Collection"; ofType: null };
              };
            };
          };
        };
        description: { name: "description"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        directFileCount: {
          name: "directFileCount";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Float"; ofType: null } };
        };
        id: {
          name: "id";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        name: {
          name: "name";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        parent: { name: "parent"; type: { kind: "OBJECT"; name: "Collection"; ofType: null } };
        previewFiles: {
          name: "previewFiles";
          type: {
            kind: "NON_NULL";
            name: never;
            ofType: {
              kind: "LIST";
              name: never;
              ofType: {
                kind: "NON_NULL";
                name: never;
                ofType: { kind: "OBJECT"; name: "File"; ofType: null };
              };
            };
          };
        };
      };
    };
    DateTime: unknown;
    File: {
      kind: "OBJECT";
      name: "File";
      fields: {
        checkedAt: {
          name: "checkedAt";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "DateTime"; ofType: null } };
        };
        collections: {
          name: "collections";
          type: {
            kind: "NON_NULL";
            name: never;
            ofType: {
              kind: "LIST";
              name: never;
              ofType: {
                kind: "NON_NULL";
                name: never;
                ofType: { kind: "OBJECT"; name: "Collection"; ofType: null };
              };
            };
          };
        };
        corrupted: {
          name: "corrupted";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Boolean"; ofType: null } };
        };
        createdAt: {
          name: "createdAt";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "DateTime"; ofType: null } };
        };
        directory: {
          name: "directory";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        displayName: {
          name: "displayName";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        exifData: { name: "exifData"; type: { kind: "OBJECT"; name: "FileExifData"; ofType: null } };
        extension: { name: "extension"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        fileName: {
          name: "fileName";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        id: {
          name: "id";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        indexedAt: {
          name: "indexedAt";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "DateTime"; ofType: null } };
        };
        info: {
          name: "info";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "FileInfo"; ofType: null } };
        };
        jobStates: {
          name: "jobStates";
          type: {
            kind: "NON_NULL";
            name: never;
            ofType: {
              kind: "LIST";
              name: never;
              ofType: {
                kind: "NON_NULL";
                name: never;
                ofType: { kind: "OBJECT"; name: "JobState"; ofType: null };
              };
            };
          };
        };
        mimeType: { name: "mimeType"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        modifiedAt: {
          name: "modifiedAt";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "DateTime"; ofType: null } };
        };
        path: {
          name: "path";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        similar: {
          name: "similar";
          type: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "OBJECT"; name: "FileConnection"; ofType: null };
          };
        };
        size: {
          name: "size";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Float"; ofType: null } };
        };
        sizeFormatted: {
          name: "sizeFormatted";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        thumbnail: {
          name: "thumbnail";
          type: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "OBJECT"; name: "FileAsset"; ofType: null };
          };
        };
        preview: { name: "preview"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        thumbnailUrl: { name: "thumbnailUrl"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        type: { name: "type"; type: { kind: "ENUM"; name: "FileType"; ofType: null } };
        unavailable: {
          name: "unavailable";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Boolean"; ofType: null } };
        };
      };
    };
    FileAsset: {
      kind: "OBJECT";
      name: "FileAsset";
      fields: {
        assetType: {
          name: "assetType";
          type: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "ENUM"; name: "FileAssetType"; ofType: null };
          };
        };
        height: {
          name: "height";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Float"; ofType: null } };
        };
        id: {
          name: "id";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        mimeType: {
          name: "mimeType";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        position: { name: "position"; type: { kind: "SCALAR"; name: "Float"; ofType: null } };
        width: {
          name: "width";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Float"; ofType: null } };
        };
      };
    };
    FileAssetType: { name: "FileAssetType"; enumValues: "Thumbnail" | "Timeline" };
    FileConnection: {
      kind: "OBJECT";
      name: "FileConnection";
      fields: {
        edges: {
          name: "edges";
          type: {
            kind: "NON_NULL";
            name: never;
            ofType: {
              kind: "LIST";
              name: never;
              ofType: {
                kind: "NON_NULL";
                name: never;
                ofType: { kind: "OBJECT"; name: "FileEdge"; ofType: null };
              };
            };
          };
        };
        pageInfo: {
          name: "pageInfo";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "PageInfo"; ofType: null } };
        };
        totalCount: {
          name: "totalCount";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Int"; ofType: null } };
        };
      };
    };
    FileEdge: {
      kind: "OBJECT";
      name: "FileEdge";
      fields: {
        cursor: {
          name: "cursor";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        node: {
          name: "node";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "File"; ofType: null } };
        };
      };
    };
    FileExifData: {
      kind: "OBJECT";
      name: "FileExifData";
      fields: {
        cameraMake: { name: "cameraMake"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        cameraModel: { name: "cameraModel"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        dateTime: { name: "dateTime"; type: { kind: "SCALAR"; name: "DateTime"; ofType: null } };
        exposureTime: { name: "exposureTime"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        fNumber: { name: "fNumber"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        flash: { name: "flash"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        focalLength: { name: "focalLength"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        iso: { name: "iso"; type: { kind: "SCALAR"; name: "Float"; ofType: null } };
        latitude: { name: "latitude"; type: { kind: "SCALAR"; name: "Float"; ofType: null } };
        lensMake: { name: "lensMake"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        lensModel: { name: "lensModel"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        longitude: { name: "longitude"; type: { kind: "SCALAR"; name: "Float"; ofType: null } };
      };
    };
    FileInfo: {
      kind: "OBJECT";
      name: "FileInfo";
      fields: {
        audioChannels: { name: "audioChannels"; type: { kind: "SCALAR"; name: "Float"; ofType: null } };
        audioCodec: { name: "audioCodec"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        bitrate: { name: "bitrate"; type: { kind: "SCALAR"; name: "Float"; ofType: null } };
        durationFormatted: {
          name: "durationFormatted";
          type: { kind: "SCALAR"; name: "String"; ofType: null };
        };
        durationSeconds: { name: "durationSeconds"; type: { kind: "SCALAR"; name: "Float"; ofType: null } };
        framerate: { name: "framerate"; type: { kind: "SCALAR"; name: "Float"; ofType: null } };
        hasEmbeddedSubtitles: {
          name: "hasEmbeddedSubtitles";
          type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        };
        hasFaces: { name: "hasFaces"; type: { kind: "SCALAR"; name: "Boolean"; ofType: null } };
        hasText: { name: "hasText"; type: { kind: "SCALAR"; name: "Boolean"; ofType: null } };
        height: { name: "height"; type: { kind: "SCALAR"; name: "Float"; ofType: null } };
        isAnimated: { name: "isAnimated"; type: { kind: "SCALAR"; name: "Boolean"; ofType: null } };
        nonVerbal: { name: "nonVerbal"; type: { kind: "SCALAR"; name: "Boolean"; ofType: null } };
        videoCodec: { name: "videoCodec"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        width: { name: "width"; type: { kind: "SCALAR"; name: "Float"; ofType: null } };
      };
    };
    FileSort: { name: "FileSort"; enumValues: "DiskCreated" | "Name" | "Path" | "Size" };
    FileSortDirection: { name: "FileSortDirection"; enumValues: "ASC" | "DESC" };
    FileType: { name: "FileType"; enumValues: "Image" | "Video" };
    Float: unknown;
    ID: unknown;
    Int: unknown;
    JobState: {
      kind: "OBJECT";
      name: "JobState";
      fields: {
        errorMessage: { name: "errorMessage"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        executedAt: {
          name: "executedAt";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "DateTime"; ofType: null } };
        };
        retries: {
          name: "retries";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Float"; ofType: null } };
        };
        retryAfter: { name: "retryAfter"; type: { kind: "SCALAR"; name: "Float"; ofType: null } };
        state: {
          name: "state";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "ENUM"; name: "State"; ofType: null } };
        };
        type: {
          name: "type";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
      };
    };
    Mutation: {
      kind: "OBJECT";
      name: "Mutation";
      fields: {
        runTask: {
          name: "runTask";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "Task"; ofType: null } };
        };
      };
    };
    PageInfo: {
      kind: "OBJECT";
      name: "PageInfo";
      fields: {
        endCursor: {
          name: "endCursor";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        hasNextPage: {
          name: "hasNextPage";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Boolean"; ofType: null } };
        };
        hasPreviousPage: {
          name: "hasPreviousPage";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Boolean"; ofType: null } };
        };
        startCursor: {
          name: "startCursor";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
      };
    };
    Query: {
      kind: "OBJECT";
      name: "Query";
      fields: {
        collection: {
          name: "collection";
          type: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "OBJECT"; name: "Collection"; ofType: null };
          };
        };
        collections: {
          name: "collections";
          type: {
            kind: "NON_NULL";
            name: never;
            ofType: {
              kind: "LIST";
              name: never;
              ofType: {
                kind: "NON_NULL";
                name: never;
                ofType: { kind: "OBJECT"; name: "Collection"; ofType: null };
              };
            };
          };
        };
        file: {
          name: "file";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "OBJECT"; name: "File"; ofType: null } };
        };
        files: {
          name: "files";
          type: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "OBJECT"; name: "FileConnection"; ofType: null };
          };
        };
        serverInfo: {
          name: "serverInfo";
          type: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "OBJECT"; name: "ServerInfo"; ofType: null };
          };
        };
        tasks: {
          name: "tasks";
          type: {
            kind: "NON_NULL";
            name: never;
            ofType: {
              kind: "LIST";
              name: never;
              ofType: {
                kind: "NON_NULL";
                name: never;
                ofType: { kind: "OBJECT"; name: "Task"; ofType: null };
              };
            };
          };
        };
      };
    };
    ServerInfo: {
      kind: "OBJECT";
      name: "ServerInfo";
      fields: {
        branch: {
          name: "branch";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        buildDate: {
          name: "buildDate";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "DateTime"; ofType: null } };
        };
        commit: {
          name: "commit";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        version: {
          name: "version";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
      };
    };
    SimilarityType: {
      name: "SimilarityType";
      enumValues: "Images" | "Related" | "SameFolder" | "SameType" | "Similar" | "Videos";
    };
    State: { name: "State"; enumValues: "Completed" | "Failed" };
    String: unknown;
    Task: {
      kind: "OBJECT";
      name: "Task";
      fields: {
        description: { name: "description"; type: { kind: "SCALAR"; name: "String"; ofType: null } };
        id: {
          name: "id";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "ID"; ofType: null } };
        };
        name: {
          name: "name";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "String"; ofType: null } };
        };
        nextRunAt: {
          name: "nextRunAt";
          type: { kind: "NON_NULL"; name: never; ofType: { kind: "SCALAR"; name: "Float"; ofType: null } };
        };
        running: { name: "running"; type: { kind: "SCALAR"; name: "Boolean"; ofType: null } };
      };
    };
  };
};

import * as gqlTada from "gql.tada";

declare module "gql.tada" {
  interface setupSchema {
    introspection: introspection;
  }
}
