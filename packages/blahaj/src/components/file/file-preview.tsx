import type { CSSProperties, FC } from "react";
import { Image, ImageFragment } from "../image";
import { setFileOverlay } from "./overlay/store";
import type { FragmentOf } from "gql.tada";
import { graphql, unmask } from "../../graphql";

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
}

export const FilePreview: FC<FilePreviewProps> = ({ file: fileFrag, style }) => {
  const file = unmask(FilePreviewFragment, fileFrag);
  const href = `/file/${file.id}`;

  return (
    <a
      href={href}
      className="transition relative overflow-hidden group"
      style={style}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setFileOverlay(file.id);
      }}
    >
      <div className="transition opacity-0 pointer-events-none absolute inset-0 z-10 group-hover:opacity-100 bg-gradient-to-t from-black/90 via-transparent to-transparent">
        <div className="p-3 flex justify-end items-start h-full flex-col">
          <h3 className="max-w-full truncate">{file.displayName}</h3>
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
        <div className="h-full w-full overflow-hidden rounded">
          <Image isThumbnail draggable={false} file={file} className="w-full h-full object-cover" />
        </div>
      )}
      {!file.thumbnailUrl && (
        <div className="flex items-center justify-center flex-col gap-2 h-full w-full bg-zinc-900 text-zinc-600 text-center text-md font-mono break-all p-6">
          {file.displayName}
        </div>
      )}
    </a>
  );
};
