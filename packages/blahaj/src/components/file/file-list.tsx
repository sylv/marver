import { memo, useEffect, useState } from 'react';
import type { FilesQueryVariables } from '../../@generated/graphql';
import { FilePage } from './file-page';

export interface FileListProps {
  variables?: FilesQueryVariables;
}

export const FileList = memo<FileListProps>(({ variables }) => {
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
        <FilePage
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
