import React, { FC, Fragment, useMemo, useRef } from 'react';
import { useClient } from 'urql';
import { MediaPreview } from '../components/media-preview';
import {
  GetMediaListDocument,
  GetMediaListQuery,
  GetMediaListQueryVariables,
  useGetMediaListQuery,
} from '../generated/graphql';
import { useMediaListRows } from '../helpers/getRows';
import { useDebounced } from '../hooks/useDebounced';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useSearchStore } from '../search';

const MARGIN = 4;

export default function HomePage() {
  const search = useSearchStore((store) => store.query);
  const client = useClient();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounced(search, 500);
  const [{ data, fetching, error }] = useGetMediaListQuery({
    variables: { search: debouncedSearch },
  });

  useInfiniteScroll({
    ref: loadMoreRef,
    hasNextPage: data?.mediaList.pageInfo.hasNextPage || false,
    loadMore: () => {
      if (!data) return;
      client
        .query<GetMediaListQuery, GetMediaListQueryVariables>(GetMediaListDocument, {
          search: debouncedSearch,
          after: data.mediaList.pageInfo.endCursor,
        })
        .toPromise();
    },
  });

  const groupedMedia = useMemo(() => {
    if (!data) return [];
    const years = new Map<string, GetMediaListQuery['mediaList']['edges']>();
    for (const edge of data.mediaList.edges) {
      const year = new Date(edge.node.file.metadata.createdAt).getFullYear().toString();
      if (!years.has(year)) years.set(year, []);
      years.get(year)?.push(edge);
    }

    return Array.from(years.entries()).map(([year, edges]) => ({
      year,
      edges,
    }));
  }, [data]);

  return (
    <Fragment>
      <main className="container mx-auto mt-6">
        {groupedMedia.map(({ year, edges }) => (
          <MediaList key={year} title={year} edges={edges} />
        ))}
        <div ref={loadMoreRef} />
      </main>
    </Fragment>
  );
}

export const MediaList: FC<{
  title: string;
  edges: GetMediaListQuery['mediaList']['edges'];
}> = ({ title, edges }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const layout = useMediaListRows(
    edges.map((edge) => edge.node),
    {
      containerRef,
      margin: MARGIN,
      rowHeight: 240,
    }
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex flex-wrap" ref={containerRef}>
        {layout.map((tile) => (
          <MediaPreview
            key={tile.data.file.id}
            media={tile.data}
            style={{
              width: tile.scaledWidth,
              height: tile.scaledHeight,
              margin: MARGIN,
            }}
          />
        ))}
      </div>
    </div>
  );
};
