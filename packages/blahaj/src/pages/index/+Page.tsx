import { FileList } from '../../components/file/file-list';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useDebounced } from '../../hooks/useDebounced';
import { useQueryState } from '../../hooks/useQueryState';

export const Page = () => {
  const [tab, setTab] = useQueryState<string>('tab', 'all');
  const [search, setSearch] = useQueryState<string>('search', '');
  const debouncedSearch = useDebounced(search, 500);

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
          <FileList variables={{ search: debouncedSearch }} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
