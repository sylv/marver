import { memo, useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { useQuery } from "urql";
import { useDisableScroll } from "../../../hooks/useDisableScroll";
import { useOnClickOutside } from "../../../hooks/useOnClickOutside";
import { SpinnerCenter, SpinnerSize } from "../../spinner";
import { FileContent, FileContentFragment } from "../file-content";
import { FileSidebar, FileSidebarFragment } from "../file-sidebar";
import { setFileOverlay, useFileOverlayStore } from "./store";
import { Accordion } from "../../accordion";
import { usePageContext } from "../../../renderer/usePageContext";
import { graphql } from "../../../graphql";

const FileOverlayQuery = graphql(
  `
  query FileOverlay($fileId: String!) {
    file(id: $fileId) {
      displayName
      ...FileSidebar
      ...FileContent
    }
  }
`,
  [FileSidebarFragment, FileContentFragment],
);

export const FileOverlay = memo(() => {
  const fileId = useFileOverlayStore((state) => state.fileId);
  const [shouldPrefetch, setShouldPrefetch] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const [{ data, fetching }] = useQuery({
    query: FileOverlayQuery,
    pause: !fileId,
    variables: {
      fileId: fileId!,
    },
  });

  useDisableScroll(!!fileId);

  useOnClickOutside(container, () => {
    setFileOverlay(null);
  });

  const pageContext = usePageContext();
  useEffect(() => {
    if (pageContext.routeParams?.fileId) {
      setFileOverlay(pageContext.routeParams.fileId);
    }
  }, [pageContext.routeParams]);

  const cancel = useCallback((event: MouseEvent) => {
    event.stopPropagation();
  }, []);

  if (!fileId) return null;
  if (!data || fetching) {
    return (
      <div className="fixed left-0 right-0 bottom-0 top-0 bg-black/90 z-20 flex items-center justify-center">
        <SpinnerCenter size={SpinnerSize.Large} />
      </div>
    );
  }

  return (
    <div
      className="fixed left-0 right-0 bottom-0 top-0 bg-black/90 z-20"
      ref={container}
      onClick={() => setFileOverlay(null)}
    >
      <div className="flex h-[100dvh]">
        <div className="flex items-center justify-center flex-grow p-12 relative" onClick={cancel}>
          <div className="absolute top-3 left-3 right-3 justify-between">
            <button type="button" className="p-3 pr-12" onClick={() => setFileOverlay(null)}>
              <LuArrowLeft className="h-5 w-5" />
            </button>
          </div>
          <div id="file-container">
            <FileContent
              file={data.file}
              className="max-w-[70dvw] max-h-[80dvh] min-w-[30em] rounded-md w-full"
            />
          </div>
        </div>
        <div
          className="bg-background border-l border-zinc-900 p-6 flex-shrink-0 w-[25em] space-y-2"
          onClick={cancel}
        >
          <Accordion id="file_info" name="File Info">
            <input type="text" className="w-full bg-zinc-900 p-2 rounded-md" value={data.file.displayName} />
            <textarea className="w-full bg-zinc-900 p-2 rounded-md" rows={3} />
          </Accordion>

          <FileSidebar file={data.file} />
        </div>
      </div>
    </div>
  );
});
