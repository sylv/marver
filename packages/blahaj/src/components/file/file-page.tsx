import { memo, useEffect, useState } from 'react';
import type { FilesQueryVariables } from '../../@generated/graphql';
import { FilePageSegment } from './file-page-segment';

export interface FilePageProps {
  variables?: FilesQueryVariables;
}

export const FilePage = memo<FilePageProps>(({ variables }) => {
  const [pageVariables, setPageVariables] = useState<FilesQueryVariables[]>([
    {
      ...variables,
      after: null,
    },
  ]);

  useEffect(() => {
    setPageVariables([
      {
        ...variables,
        after: null,
      },
    ]);
  }, [variables]);

  return (
    <div>
      {pageVariables.map((variables, index) => (
        <FilePageSegment
          key={'file-view-' + variables.after}
          isLastPage={index === pageVariables.length - 1}
          onLoadMore={(cursor) => {
            const baseVariables = pageVariables[index];
            setPageVariables([...pageVariables, { ...baseVariables, after: cursor }]);
          }}
          variables={{
            ...variables,
            // with ssr, preview data for images adds up quickly. 28 images = 200kb of html.
            // so the first page is smaller so the user sees it faster, then it ramps up to 100
            // to make for a smoother scrolling experience.
            first: index === 0 ? 28 : 100,
          }}
        />
      ))}
    </div>
  );
});
