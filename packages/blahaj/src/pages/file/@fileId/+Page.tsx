import type { FC } from "react";
import { useQuery } from "urql";
import { graphql } from "../../../@generated";
import { SpinnerCenter } from "../../../components/spinner";
import type { PageProps } from "../../../renderer/types";
import { useMediaStore } from "./media.store";
import { FileView } from "../../../components/file/file-view";

const FileQuery = graphql(`
  query File($fileId: String!) {
    file(id: $fileId) {
      ...FileViewProps
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
    <div className="container mx-auto mt-10 space-y-2">
      <FileView file={data.file} />
    </div>
  );
};
