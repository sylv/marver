import clsx from "clsx";
import { memo, useEffect, useRef, useState } from "react";
import { useQuery } from "urql";
import { graphql } from "../../@generated";
import type { FilesQueryVariables } from "../../@generated/graphql";
import { cn } from "../../helpers/cn";
import { FilePreview } from "./file-preview";

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
        node {
          id
          thumbnailUrl
          info {
            height
            width
          }
          ...FilePreviewProps
        }
      }
    }
  }
`);

export const FileQuerySegment = memo<FileQuerySegmentProps>(
  ({ variables, isLastPage, isFirstPage, targetWidth = 250, rowHeight = 200, onLoadMore }) => {
    const [unloadWithHeight, setUnloadWithHeight] = useState<number | null>(null);
    const loaderRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
      if (!containerRef.current) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (containerRef.current && !entries[0].isIntersecting && containerRef.current.clientHeight >= 80) {
            // unload when off screen by a large margin.
            // helps with performance, though introduces some flickering if you scroll fast.
            // todo: try reduce flickering.
            setUnloadWithHeight(containerRef.current.clientHeight);
          } else {
            setUnloadWithHeight(null);
          }
        },
        {
          // this is the margin that the observer will use to determine if the element is in the viewport.
          // so 300% here means it has to be off screen by 300% of the screen height to be considered off screen.
          // the 200% buffer here is to try prevent flickering when scrolling. it could be higher/lower, 300% seems fine for perf+ux balance.
          rootMargin: "300% 0px 300% 0px",
        },
      );

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, [containerRef]);

    return (
      <div
        ref={containerRef}
        className={cn("relative mb-2", isLastPage && "mb-20")}
        style={{
          height: unloadWithHeight || undefined,
        }}
      >
        <div className="flex flex-wrap gap-2">
          {!unloadWithHeight &&
            data?.files.edges.map(({ node: file }) => {
              const aspectRatio =
                file.info.width && file.info.height ? file.info.width / file.info.height : 1;

              return (
                <FilePreview
                  key={file.id}
                  file={file}
                  style={{
                    width: aspectRatio * targetWidth,
                    flexGrow: aspectRatio * targetWidth,
                    height: rowHeight,
                  }}
                />
              );
            })}
        </div>
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
