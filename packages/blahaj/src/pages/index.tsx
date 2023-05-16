import React, { Fragment, useRef } from 'react';
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
  const debouncedSearch = useDebounced(search, 500);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLAnchorElement>(null);
  const [{ data, fetching, error }] = useGetMediaListQuery({
    variables: { search: debouncedSearch },
  });

  useInfiniteScroll({
    hasNextPage: data?.mediaList.pageInfo.hasNextPage || false,
    ref: loadMoreRef,
    loadMore: () => {
      console.log('LOAD MORE');
      client
        .query<GetMediaListQuery, GetMediaListQueryVariables>(GetMediaListDocument, {
          search: debouncedSearch,
          after: data?.mediaList.pageInfo.endCursor,
        })
        .toPromise();
    },
  });

  const total = data?.mediaList.edges.length ?? 0;
  const layout = useMediaListRows(
    data?.mediaList.edges.map((edge) => edge.node),
    {
      margin: MARGIN,
      rowHeight: 240,
      containerRef,
    }
  );

  return (
    <Fragment>
      <main className="container mx-auto mt-6">
        <div ref={containerRef} className="flex flex-wrap">
          {layout.map((tile, index) => {
            const useLoadMoreRef = index === total - 10;
            return (
              <MediaPreview
                key={tile.data.file.id}
                media={tile.data}
                ref={useLoadMoreRef ? loadMoreRef : undefined}
                style={{
                  width: tile.scaledWidth,
                  height: tile.scaledHeight,
                  margin: MARGIN,
                }}
              />
            );
          })}
        </div>
      </main>
    </Fragment>
  );
}
