import { memo } from "react";
import { graphql, unmask, type FragmentType } from "../../@generated";
import { FileType } from "../../@generated/graphql";
import { Image } from "../image";
import { Player } from "../player/player";
import clsx from "clsx";

const Frag = graphql(`
    fragment FileContentProps on File {
      id
      name
      type
      thumbnailUrl
      info {
        height
        width
        durationSeconds
      }
      ...ImageProps
    }
`);

interface FileContentProps {
  file: FragmentType<typeof Frag>;
  className?: string;
  videoClassName?: string;
  imageClassName?: string;
  onClick?: () => void;
}

export const FileContent = memo<FileContentProps>(
  ({ file: fileFrag, className, videoClassName, imageClassName }) => {
    const file = unmask(Frag, fileFrag);
    if (file.type === FileType.Video) {
      return (
        <Player
          src={`/api/files/${file.id}/raw`}
          hlsSrc={`/api/files/${file.id}/vidproxy/index.m3u8`}
          height={file?.info.height || undefined}
          width={file?.info.width || undefined}
          durationSeconds={file.info.durationSeconds || undefined}
          className={clsx(className, videoClassName)}
        />
      );
    }

    if (file.type === FileType.Image && file.thumbnailUrl) {
      return <Image file={file} className={clsx(className, imageClassName)} />;
    }

    return (
      <div
        className={clsx(
          "bg-zinc-900 flex items-center justify-center text-sm text-zinc-700 min-h-[20em] min-w-[40em] select-none",
          className,
        )}
      >
        <div>Could not preview file</div>
      </div>
    );
  },
);
