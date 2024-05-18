import { memo } from "react";
import { type FilePageProps, FileQuery } from "./file-query";
import { TabsContent } from "@radix-ui/react-tabs";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { useQueryState } from "../../hooks/useQueryState";
import { useDebounced } from "../../hooks/useDebounced";

export const FileQueryWithFilters = memo<FilePageProps>(({ variables }) => {
  const [tab, setTab] = useQueryState<string>("tab", "all");
  const [search, setSearch] = useQueryState<string>("search", "");
  const debouncedSearch = useDebounced(search, 500);

  return (
    <div>
      <Tabs value={tab} onValueChange={(value) => setTab(value)}>
        <div className="flex items-center gap-2">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="by_year">By Year</TabsTrigger>
          </TabsList>
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" />
        </div>
        <TabsContent value="all" className="mt-2">
          <FileQuery
            variables={{
              ...variables,
              search: debouncedSearch,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
});
