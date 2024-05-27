import clsx from "clsx";
import { memo, useEffect, useRef } from "react";
import { useQuery } from "urql";
import { graphql } from "../../@generated";
import type { FilesQueryVariables } from "../../@generated/graphql";
import { cn } from "../../helpers/cn";
import { FileList } from "./file-list";

interface FileQuerySegmentProps {
  variables: FilesQueryVariables;
  isLastPage: boolean;
  isFirstPage: boolean;
  targetWidth?: number;
  rowHeight?: number;
  onLoadMore: (cursor: string) => void;
}

const FilesQuery = graphql(`
  query Files($search: String, $after: String, $first: Float, $collectionId: ID) {
    files(search: $search, after: $after, first: $first, collectionId: $collectionId) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        ...FileListProps
      }
    }
  }
`);

export const FileQuerySegment = memo<FileQuerySegmentProps>(
  ({ variables, isLastPage, isFirstPage, targetWidth, rowHeight, onLoadMore }) => {
    const loaderRef = useRef<HTMLDivElement>(null);
    const [{ fetching, data }] = useQuery({
      query: FilesQuery,
      variables: variables,
    });

    useEffect(() => {
      // load more when loaderRef is in viewport
      if (!loaderRef.current || !isLastPage) return;
      if (!data || !data.files.pageInfo.hasNextPage) return;
      const observer = new IntersectionObserver((entries) => {
        if (!data || fetching) return;
        if (entries[0].isIntersecting && data.files.pageInfo.hasNextPage) {
          onLoadMore(data.files.pageInfo.endCursor);
        }
      });

      observer.observe(loaderRef.current);
      return () => observer.disconnect();
    }, [loaderRef, isLastPage, data, fetching, onLoadMore]);

    return (
      <div className={cn("relative mb-2", isLastPage && "mb-20")}>
          <FileList files={data?.files.edges} targetWidth={targetWidth} rowHeight={rowHeight} />
        {isLastPage && (
          <div
            ref={loaderRef}
            className={clsx(
              "absolute left-0 right-0 bottom-0 pointer-events-none",
              isFirstPage ? "h-1" : "h-[125dvh]", // otherwise we immediately load the next page
            )}
          />
        )}
      </div>
    );
  },
);
