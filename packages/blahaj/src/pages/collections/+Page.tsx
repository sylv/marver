import type { FC } from 'react';
import { useQuery } from 'urql';
import { graphql } from '../../@generated';
import { CollectionPreview } from '../../components/collection/collection-preview';
import { SpinnerCenter } from '../../components/spinner';
import type { PageProps } from '../../renderer/types';

const CollectionsQuery = graphql(`
  query CollectionsQuery {
    collections {
      id
      ...CollectionPreviewProps
    }
  }
`);

export const Page: FC<PageProps> = () => {
  const [{ data, error }] = useQuery({
    query: CollectionsQuery,
  });

  if (error) return <div>Oh no... {error.message}</div>;
  if (!data) return <SpinnerCenter />;

  return (
    <div className="container mx-auto mt-10">
      <div className="grid grid-cols-4 gap-2">
        {data.collections.map((collection) => (
          <CollectionPreview key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
};
