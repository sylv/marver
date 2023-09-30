import { Fragment, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useQueryState } from '../hooks/useQueryState';
import { useMediaListQuery } from '../@generated/graphql';
import { Loading } from '../components/loading';
import { MediaPreview } from '../components/media-preview';
import { Input } from '../components/ui/input';
import { useDebounced } from '../hooks/useDebounced';
import { useMediaListRows } from '../helpers/getRows';

export default function HomePage() {
  const [tab, setTab] = useQueryState<string>('tab', 'gallery');
  const [search, setSearch] = useQueryState<string>('search', '');
  const loaderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounced(search, 500);
  const { error, loading, data, fetchMore } = useMediaListQuery({
    variables: {
      search: debouncedSearch.trim() || undefined,
    },
  });

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (!data || loading) return;
      if (entries[0].isIntersecting) {
        fetchMore({
          variables: {
            after: data?.mediaList.pageInfo.endCursor,
          },
        });
      }
    });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loaderRef.current, data, loading]);

  const grid = useMediaListRows(data?.mediaList.edges?.map((edge) => edge.node), {
    containerRef: containerRef,
    margin: 4,
    rowHeight: 300,
    maxPerRow: 6,
  });

  return (
    <div className="container mx-auto mt-20">
      <Tabs value={tab} onValueChange={(value) => setTab(value)}>
        <div className="flex items-center gap-2">
          <TabsList>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="tv_shows">TV Shows</TabsTrigger>
            <TabsTrigger value="movies">Movies</TabsTrigger>
          </TabsList>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" />
        </div>
        <TabsContent value="gallery">
          <div className="flex flex-wrap" ref={containerRef}>
            {grid.map((cell) => (
              <MediaPreview
                media={cell.data}
                key={cell.data.file.id}
                style={{
                  height: cell.scaledHeight,
                  width: cell.scaledWidth,
                  margin: 4,
                }}
              />
            ))}
          </div>
        </TabsContent>
        {data?.mediaList.pageInfo.hasNextPage && (
          <div ref={loaderRef} className="h-10 w-full bg-black" />
        )}
      </Tabs>
    </div>
  );
}
