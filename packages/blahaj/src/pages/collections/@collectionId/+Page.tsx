import { useMemo, type FC } from "react";
import type { PageProps } from "../../../renderer/types";
import { useQuery } from "urql";
import { SpinnerCenter } from "../../../components/spinner";
import {
  CollectionPreview,
  CollectionPreviewFragment,
} from "../../../components/collection/collection-preview";
import { FileQuery } from "../../../components/file/file-query";
import { graphql } from "../../../graphql";

const CollectionQuery = graphql(
  `
  query CollectionQuery($collectionId: String!) {
    collection(id: $collectionId) {
      id
      name
      description
      directFileCount
      parent {
        id
        name
      }
      children {
        id
        ...CollectionPreview
      }
    }
  }
`,
  [CollectionPreviewFragment],
);

export const Page: FC<PageProps> = ({ routeParams }) => {
  const collectionId = routeParams.collectionId!;
  const [{ data, error }] = useQuery({
    query: CollectionQuery,
    variables: {
      collectionId: collectionId,
    },
  });

  const back = useMemo(() => {
    if (!data?.collection) return null;
    if (data.collection.parent) {
      return {
        href: `/collections/${data.collection.parent.id}`,
        title: data.collection.parent.name,
      };
    }

    return {
      href: "/collections",
      title: "Collections",
    };
  }, [data?.collection]);

  if (error) return <div>Oh no... {error.message}</div>;
  if (!data) return <SpinnerCenter />;

  return (
    <div className="container mx-auto mt-10 space-y-2">
      <div className="sticky top-0 z-20 py-4 bg-background">
        {back && (
          <div className="mb-2 text-gray-400 text-sm hover:underline">
            <a href={back.href}>&larr; Back to {back.title}</a>
          </div>
        )}
        <h1 className="fontb-old text-2xl">{data.collection.name}</h1>
        <p>{data.collection.description}</p>
      </div>
      {data.collection.children[0] && (
        <div className="grid grid-cols-4 gap-2">
          {data.collection.children.map((collection) => (
            <CollectionPreview key={collection.id} collection={collection} />
          ))}
        </div>
      )}
      {data.collection.directFileCount !== 0 && <FileQuery variables={{ collectionId }} />}
    </div>
  );
};
