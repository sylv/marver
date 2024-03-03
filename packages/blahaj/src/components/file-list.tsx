/* eslint-disable jsx-a11y/alt-text */
import { memo, useEffect, useRef } from 'react';
import { useQuery } from 'urql';
import { FilesDocument, type FilesQueryVariables } from '../@generated/graphql';
import { FilePreview } from './file-preview';
import { cn } from '../helpers/cn';

export interface FileViewProps {
  variables: FilesQueryVariables;
  isLastPage: boolean;
  targetWidth?: number;
  rowHeight?: number;
  onLoadMore: (cursor: string) => void;
}

export const FileView = memo<FileViewProps>(
  ({ variables, isLastPage, targetWidth = 250, rowHeight = 200, onLoadMore }) => {
    const loaderRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [{ fetching, data }] = useQuery({
      query: FilesDocument,
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
      <div ref={containerRef} className={cn('relative mb-2', isLastPage && 'mb-20')}>
        <div className="flex flex-wrap gap-2">
          {data?.files.edges.map(({ node: file }) => {
            if (!file.info.height || !file.info.width || !file.thumbnailUrl) return null;
            const aspectRatio = file.info.width / file.info.height;
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
          <div ref={loaderRef} className="absolute left-0 right-0 bottom-0 h-[125dvh] pointer-events-none" />
        )}
      </div>
    );
  },
);
