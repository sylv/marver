import { memo, useState } from "react";
import { graphql } from "../../../@generated";
import { FileView } from "../file-view";
import { setFileOverlay, useFileOverlayStore } from "./store";
import { useQuery } from "urql";
import { SpinnerCenter, SpinnerSize } from "../../spinner";
import { useDisableScroll } from "../../../hooks/useDisableScroll";

const FileOverlayQuery = graphql(`
  query FileOverlay($fileId: String!) {
    file(id: $fileId) {
      ...FileViewProps
    }
  }
`);

export const FileOverlay = memo(() => {
  const fileId = useFileOverlayStore((state) => state.fileId);
  const [shouldPrefetch, setShouldPrefetch] = useState(false);
  const [{ data, fetching }] = useQuery({
    query: FileOverlayQuery,
    pause: !fileId,
    variables: {
      fileId: fileId!,
    },
  });

  useDisableScroll(!!fileId);

  if (!fileId) return null;
  if (!data || fetching) {
    return (
      <div className="fixed left-0 right-0 bottom-0 top-0 bg-black/90 z-20 flex items-center justify-center">
        <SpinnerCenter size={SpinnerSize.Large} />
      </div>
    );
  }

  return (
    <div className="fixed left-0 right-0 bottom-0 top-0 bg-black/90 z-20">
      <div className="container mx-auto mt-20">
        <FileView
          file={data.file}
          onClickOutside={() => {
            setFileOverlay(null);
          }}
        />
      </div>
    </div>
  );
});
