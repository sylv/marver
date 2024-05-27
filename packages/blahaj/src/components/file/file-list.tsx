import { memo, useEffect, useRef, useState } from "react";
import { graphql, unmask, type FragmentType } from "../../@generated";
import { FilePreview } from "./file-preview";

const Frag = graphql(`
    fragment FileListProps on FileEdge {
        node {
            id
            info {
                height
                width
            }
            ...FilePreviewProps
        }
    }
`);

export interface FileListProps {
  targetWidth?: number;
  rowHeight?: number;
  files?: FragmentType<typeof Frag>[];
}

export const FileList = memo<FileListProps>(({ files: filesFrag, targetWidth = 250, rowHeight = 200 }) => {
  const [unloadWithHeight, setUnloadWithHeight] = useState<number | null>(null);
  const files = unmask(Frag, filesFrag);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (containerRef.current && !entries[0].isIntersecting && containerRef.current.clientHeight >= 80) {
          // unload when off screen by a large margin.
          // helps with performance, though introduces some flickering if you scroll fast.
          // todo: try reduce flickering.
          setUnloadWithHeight(containerRef.current.clientHeight);
        } else {
          setUnloadWithHeight(null);
        }
      },
      {
        // this is the margin that the observer will use to determine if the element is in the viewport.
        // so 300% here means it has to be off screen by 300% of the screen height to be considered off screen.
        // the 200% buffer here is to try prevent flickering when scrolling. it could be higher/lower, 300% seems fine for perf+ux balance.
        rootMargin: "300% 0px 300% 0px",
      },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  return (
    <div
      className="flex flex-wrap gap-[0.35rem] max-w-[85vw]"
      ref={containerRef}
      style={{
        height: unloadWithHeight || undefined,
      }}
    >
      {!unloadWithHeight &&
        files?.map(({ node: file }) => {
          const aspectRatio = file.info.width && file.info.height ? file.info.width / file.info.height : 1;

          return (
            <FilePreview
              key={file.id}
              file={file}
              style={{
                width: aspectRatio * targetWidth,
                flexGrow: aspectRatio * targetWidth,
                height: rowHeight,
              }}
            />
          );
        })}
    </div>
  );
});
