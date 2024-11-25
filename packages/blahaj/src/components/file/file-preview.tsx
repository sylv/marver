import type { FragmentOf } from "gql.tada";
import { useRef, type CSSProperties, type FC } from "react";
import { graphql, unmask } from "../../graphql";
import { Image, ImageFragment } from "../image";
import { motion } from "framer-motion";

export const FilePreviewFragment = graphql(
  `
  fragment FilePreview on File {
    id
    displayName
    extension
    thumbnailUrl
    info {
      durationFormatted
      isAnimated
    }
    ...Image
  }
`,
  [ImageFragment],
);

interface FilePreviewProps {
  file: FragmentOf<typeof FilePreviewFragment>;
  style?: CSSProperties;
  onClick?: (offsetTop: number) => void;
}

export const FilePreview: FC<FilePreviewProps> = ({ file: fileFrag, style, onClick }) => {
  const file = unmask(FilePreviewFragment, fileFrag);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      // biome-ignore lint/a11y/useSemanticElements: if this is a button element, it breaks the image preview
      // as the preview only takes up half the width. i couldn't figure it out, changing the button to inline-block
      // or similar didn't fix it.
      role="button"
      tabIndex={0}
      className="transition relative overflow-hidden group box-border"
      style={style}
      onClick={(event) => {
        if (!ref.current || !onClick) return;
        onClick(ref.current.offsetTop + ref.current.clientHeight);
      }}
    >
      <div className="transition opacity-0 pointer-events-none absolute inset-0 z-10 group-hover:opacity-100 bg-gradient-to-t from-black/90 via-transparent to-transparent">
        <div className="p-3 flex justify-end items-start h-full flex-col">
          <motion.h3 className="max-w-full truncate">{file.displayName}</motion.h3>
        </div>
      </div>
      <div className="absolute top-1 left-1 flex items-center gap-1 flex-wrap">
        {file.info.isAnimated && file.extension && (
          <span className="p-1 z-10 text-xs bg-black/70 rounded-lg">{file.extension.toUpperCase()}</span>
        )}
        {file?.info.durationFormatted && (
          <span className="p-1 z-10 text-xs bg-black/70 rounded-lg">{file.info.durationFormatted}</span>
        )}
      </div>
      {file.thumbnailUrl && (
        <motion.div className="h-full w-full overflow-hidden rounded">
          <Image isThumbnail draggable={false} file={file} className="w-full h-full object-cover" />
        </motion.div>
      )}
      {!file.thumbnailUrl && (
        <motion.div className="flex items-center justify-center flex-col gap-2 h-full w-full bg-zinc-900 text-zinc-600 text-center text-md font-mono break-all p-6">
          {file.displayName}
        </motion.div>
      )}
    </div>
  );
};
