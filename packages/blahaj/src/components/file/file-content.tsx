import type { FC } from "react";
import { Image, ImageFragment } from "../image";
import { Player } from "../player/player";
import clsx from "clsx";
import { graphql, unmask, type FragmentOf } from "../../graphql";

export const FileContentFragment = graphql(
  `
    fragment FileContent on File {
      id
      type
      thumbnailUrl
      info {
        height
        width
        durationSeconds
      }
      ...Image
    }
  `,
  [ImageFragment],
);

interface FileContentProps {
  file: FragmentOf<typeof FileContentFragment>;
  className?: string;
  videoClassName?: string;
  imageClassName?: string;
  onClick?: () => void;
}

export const FileContent: FC<FileContentProps> = ({
  file: fileFrag,
  className,
  videoClassName,
  imageClassName,
}) => {
  const file = unmask(FileContentFragment, fileFrag);
  if (file.type === "Video") {
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

  if (file.type === "Image" && file.thumbnailUrl) {
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
};
