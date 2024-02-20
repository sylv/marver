import { memo, useEffect, useRef } from 'react';
import { useQuery } from 'urql';
import { FilesDocument, type FilesQueryVariables } from '../../@generated/graphql';
import { useMediaListRows } from '../../helpers/getRows';
import { MediaPreview } from '../../components/media-preview';

export interface FileViewProps {
  variables: FilesQueryVariables;
  isLastPage: boolean;
  onLoadMore: (cursor: string) => void;
}

export const FileView = memo<FileViewProps>(({ variables, isLastPage, onLoadMore }) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [{ fetching, data }] = useQuery({
    query: FilesDocument,
    variables: variables,
  });

  const grid = useMediaListRows(
    data?.files.edges?.map((edge) => edge.node),
    {
      containerRef: containerRef,
      margin: 4,
      rowHeight: 300,
      maxPerRow: 6,
      // if we render the last row and get additional images later,
      // that row will likely be adjusted to fit some of those new images.
      // that causes the UI to jump around, so we just hide the last row
      // until there are no more images to load.
      skipLastRow: !!data?.files.pageInfo.hasNextPage,
    },
  );

  useEffect(() => {
    if (!loaderRef.current || !isLastPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (!data || fetching) return;
      if (entries[0].isIntersecting) {
        onLoadMore(data.files.pageInfo.endCursor);
      }
    });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loaderRef, isLastPage, data, fetching, onLoadMore]);

  return (
    <div className="relative">
      <div className="flex flex-wrap " ref={containerRef}>
        {grid.map((cell) => (
          <MediaPreview
            file={cell.data}
            key={cell.data.id}
            style={{
              height: cell.scaledHeight,
              width: cell.scaledWidth,
              margin: 4,
            }}
          />
        ))}
      </div>
      {isLastPage && (
        <div
          ref={loaderRef}
          className="absolute left-0 right-0 bottom-[100vh] z-10 h-10 pointer-events-none"
        />
      )}
    </div>
  );
});
