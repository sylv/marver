import clsx from "clsx";
import { useEffect, useRef, type FC } from "react";
import { useQuery } from "urql";
import { cn } from "../../helpers/cn";
import { FileList, FileListFragment } from "./file-list";
import { graphql, type VariablesOf } from "../../graphql";

interface FileQuerySegmentProps {
  variables: VariablesOf<typeof FilesQuery>;
  isLastPage: boolean;
  isFirstPage: boolean;
  targetWidth?: number;
  rowHeight?: number;
  onLoadMore: (cursor: string) => void;
}

export const FilesQuery = graphql(
  `
  query Files($search: String, $after: String, $first: Float) {
    files(search: $search, after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        ...FileList
      }
    }
  }
`,
  [FileListFragment],
);

export const FileQuerySegment: FC<FileQuerySegmentProps> = ({
  variables,
  isLastPage,
  isFirstPage,
  targetWidth,
  rowHeight,
  onLoadMore,
}) => {
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
};
