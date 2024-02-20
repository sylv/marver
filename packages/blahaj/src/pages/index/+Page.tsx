import { useEffect, useState } from 'react';
import type { FilesQueryVariables } from '../../@generated/graphql';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useDebounced } from '../../hooks/useDebounced';
import { useQueryState } from '../../hooks/useQueryState';
import { FileView } from './view';

export const Page = () => {
  const [tab, setTab] = useQueryState<string>('tab', 'all');
  const [search, setSearch] = useQueryState<string>('search', '');
  const debouncedSearch = useDebounced(search, 500);
  const [pageVariables, setPageVariables] = useState<FilesQueryVariables[]>([
    {
      after: null,
      search: debouncedSearch || null,
    },
  ]);

  useEffect(() => {
    setPageVariables([{ after: null, search: debouncedSearch }]);
  }, [debouncedSearch]);

  return (
    <div className="container mx-auto mt-20">
      <Tabs value={tab} onValueChange={(value) => setTab(value)}>
        <div className="flex items-center gap-2">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="by_year">By Year</TabsTrigger>
          </TabsList>
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" />
        </div>
        <TabsContent value="all">
          {pageVariables.map((variables, index) => (
            <FileView
              key={'file-view-' + variables.after}
              variables={variables}
              isLastPage={index === pageVariables.length - 1}
              onLoadMore={(cursor) => {
                const baseVariables = pageVariables[index];
                setPageVariables([...pageVariables, { ...baseVariables, after: cursor }]);
              }}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
