import { motion } from "framer-motion";
import { memo, useEffect, useRef } from "react";
import { graphql, unmask, type FragmentOf } from "../../graphql";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { ImageFragment } from "../image";
import { FileContent, FileContentFragment } from "./file-content";

export const FileOverlayFragment = graphql(
  `
    fragment FileOverlay on File {
        id
        displayName
        ...Image
        ...FileContent
    }
`,
  [ImageFragment, FileContentFragment],
);

export interface FileOverlayProps {
  file: FragmentOf<typeof FileOverlayFragment>;
  offsetTop: number;
  height: number;
  onClose: () => void;
}

export const FileOverlay = memo<FileOverlayProps>(({ file: fileFrag, offsetTop, height, onClose }) => {
  const file = unmask(FileOverlayFragment, fileFrag);
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    {
      ref: containerRef,
      mouseup: true, // necessary or else it flashes when clicking a different file because the mousedown registers before the onClick
    },
    onClose,
  );

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [containerRef, file.id]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      style={{ top: offsetTop, height }}
      className="absolute left-0 right-0 will-change-[opacity] bg-black/90 backdrop-blur-lg p-5 flex items-center justify-center z-20 scroll-m-6"
    >
      <div>
        <div className="font-lg text-2xl font-semibold">{file.displayName}</div>
        <motion.div className="bg-black rounded-lg">
          <FileContent file={file} className="max-h-[30em] w-min" />
        </motion.div>
      </div>
    </motion.div>
  );
});
