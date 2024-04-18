import { memo, useRef } from "react";
import { graphql, unmask, type FragmentType } from "../../@generated";
import { FileType } from "../../@generated/graphql";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { Image } from "../image";
import { Player } from "../player/player";
import { Card } from "../ui/card";
import { FileExif } from "./sidebar/exif/file-exif";
import { FileLocation } from "./sidebar/file-location";
import { FileTasks } from "./sidebar/file-tasks";

const Fragment = graphql(`
    fragment FileViewProps on File {
      id
      name
      type
      thumbnailUrl
      info {
        height
        width
        durationSeconds
      }
      ...FileLocationProps
      ...FileTasksProps
      ...FileExifProps
      ...ImageProps
    }
`);

interface FileViewProps {
  file: FragmentType<typeof Fragment>;
  onClickOutside?: () => void;
}

const cancel = (event: React.MouseEvent) => event.stopPropagation();

export const FileView = memo<FileViewProps>(({ file: fileFrag, onClickOutside }) => {
  const file = unmask(Fragment, fileFrag);
  const container = useRef<HTMLDivElement>(null);

  useOnClickOutside(container, () => {
    if (onClickOutside) onClickOutside();
  });

  return (
    <div className="grid grid-cols-4 gap-3" ref={container} onClick={onClickOutside}>
      <div className="col-span-3 space-y-3" onClick={cancel}>
        <Card className="text-xl font-semibold truncate bg-zinc-900 px-3 py-1">
          <h1>{file.name}</h1>
        </Card>
        <Card className="bg-black overflow-hidden h-min">
          {file.type === FileType.Video && file.thumbnailUrl && (
            <Player
              src={`/api/files/${file.id}/raw`}
              hlsSrc={`/api/files/${file.id}/vidproxy/index.m3u8`}
              height={file?.info.height || undefined}
              width={file?.info.width || undefined}
              durationSeconds={file.info.durationSeconds || undefined}
              className="max-h-[80vh] h-full w-full bg-black"
            />
          )}
          {file.type === FileType.Image && file.thumbnailUrl && (
            <Image file={file} className="max-h-[80vh] bg-black object-contain w-full" />
          )}
        </Card>
      </div>
      <div id="file-sidebar" className="space-y-3 h-min" onClick={cancel}>
        <FileExif file={file} />
        <FileLocation file={file} />
        <FileTasks file={file} />
      </div>
    </div>
  );
});
