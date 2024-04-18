import { memo, type CSSProperties } from "react";
import { graphql, unmask, type FragmentType } from "../../@generated";
import { Image } from "../image";
import { setFileOverlay } from "./overlay/store";

const Fragment = graphql(`
  fragment FilePreviewProps on File {
    id
    name
    info {
      durationFormatted
    }
    ...ImageProps
  }
`);

interface FilePreviewProps {
  file: FragmentType<typeof Fragment>;
  style?: CSSProperties;
}

export const FilePreview = memo<FilePreviewProps>(({ file: fileFrag, style }) => {
  const file = unmask(Fragment, fileFrag);
  const href = `/file/${file.id}`;

  return (
    <a
      href={href}
      className="transition relative overflow-hidden rounded-lg group"
      style={style}
      onClick={(event) => {
        if (window.location.pathname.startsWith("/file")) return;
        event.preventDefault();
        event.stopPropagation();
        setFileOverlay(file.id);
      }}
    >
      <div className="transition opacity-0 pointer-events-none absolute inset-0 z-10 group-hover:opacity-100 bg-gradient-to-t from-black/90 via-transparent to-transparent">
        <div className="p-3 flex justify-end items-start h-full flex-col">
          <h3 className="max-w-full truncate">{file.name}</h3>
        </div>
      </div>
      {file?.info.durationFormatted && (
        <span className="absolute top-1 left-1 p-1 z-10 text-xs bg-black/70 rounded-lg">
          {file.info.durationFormatted}
        </span>
      )}
      <div key={file.id} className="h-full w-full overflow-hidden rounded">
        <Image draggable={false} file={file} className="w-full h-full object-cover" />
      </div>
    </a>
  );
});
