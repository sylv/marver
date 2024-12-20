import { useEffect, useRef, useState, type FC } from "react";
import { FileQuerySegment, type FilesQuery } from "./file-query-segment";
import type { VariablesOf } from "gql.tada";

type FilesQueryVariables = VariablesOf<typeof FilesQuery>;

export interface FilePageProps {
  variables?: FilesQueryVariables;
}

export const FileQuery: FC<FilePageProps> = ({ variables }) => {
  const currentVariables = useRef(variables);
  const [pageVariables, setPageVariables] = useState<FilesQueryVariables[]>([
    {
      ...variables,
      after: null,
    },
  ]);

  useEffect(() => {
    // without this, re-renders cause the page to jump to the top because
    // react does not deep compare variables, so we think it changes on every render.
    if (JSON.stringify(currentVariables.current) === JSON.stringify(variables)) return;
    currentVariables.current = variables;
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
        <FileQuerySegment
          key={"file-view-" + variables.after}
          isFirstPage={index === 0}
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
            first: index === 0 ? 38 : 100,
          }}
        />
      ))}
    </div>
  );
};
