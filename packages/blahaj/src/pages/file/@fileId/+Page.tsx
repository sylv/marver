import type { FC } from "react";
import { useQuery } from "urql";
import { graphql } from "../../../@generated";
import { SpinnerCenter } from "../../../components/spinner";
import type { PageProps } from "../../../renderer/types";
import { useMediaStore } from "./media.store";
import { FileSidebar } from "../../../components/file/file-sidebar";
import { Card } from "../../../components/ui/card";
import { FileContent } from "../../../components/file/file-content";

const FileQuery = graphql(`
  query File($fileId: String!) {
    file(id: $fileId) {
      id
      name
      ...FileSidebarProps
      ...FileContentProps
    }
  }
`);

export const Page: FC<PageProps> = ({ routeParams }) => {
  const fileId = routeParams.fileId!;
  const filter = useMediaStore((state) => state.filter);
  const [{ data, fetching, error }] = useQuery({
    query: FileQuery,
    variables: {
      fileId: fileId,
      filter: filter,
    },
  });

  if (error) return <div>Oh no... {error.message}</div>;
  if (fetching || !data?.file) return <SpinnerCenter />;

  return (
    <div className="m-6">
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-3 space-y-3">
          <Card className="text-xl font-semibold truncate bg-zinc-900 px-3 py-1">
            <h1>{data.file.name}</h1>
          </Card>
          <Card className="bg-black overflow-hidden h-min">
            <FileContent file={data.file} className="w-full" imageClassName="object-contain" />
          </Card>
        </div>
        <FileSidebar file={data.file} />
      </div>
    </div>
  );
};
