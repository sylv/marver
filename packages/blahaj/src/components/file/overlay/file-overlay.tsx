import { memo, useCallback, useRef, useState, type MouseEvent } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { useQuery } from "urql";
import { graphql } from "../../../@generated";
import { useDisableScroll } from "../../../hooks/useDisableScroll";
import { useOnClickOutside } from "../../../hooks/useOnClickOutside";
import { SpinnerCenter, SpinnerSize } from "../../spinner";
import { FileContent } from "../file-content";
import { FileSidebar } from "../file-sidebar";
import { setFileOverlay, useFileOverlayStore } from "./store";

const FileOverlayQuery = graphql(`
  query FileOverlay($fileId: String!) {
    file(id: $fileId) {
      name
      ...FileSidebarProps
      ...FileContentProps
    }
  }
`);

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
        <div className="flex items-center justify-center flex-grow p-12" onClick={cancel}>
          <div className="absolute top-3 left-3 right-3 justify-between">
            <button type="button" className="p-3 pr-12" onClick={() => setFileOverlay(null)}>
              <LuArrowLeft className="h-5 w-5" />
            </button>
          </div>
          <div id="file-container">
            <FileContent file={data.file} className="max-w-[70dvw] max-h-[80dvh] rounded-md object-contain" />
          </div>
        </div>
        <div className="bg-background border-l border-zinc-900 p-6 flex-shrink-0 w-[25em]" onClick={cancel}>
          <h1 className="mb-2 font-semibold break-all">{data.file.name}</h1>
          <FileSidebar file={data.file} />
        </div>
      </div>
    </div>
  );
});
