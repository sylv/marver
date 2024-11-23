import type { FC } from "react";
import { type FragmentOf, graphql, unmask } from "../../graphql";
import { FileExif, FileExifFragment } from "./sidebar/exif/file-exif";
import { FileLocation, FileLocationFragment } from "./sidebar/file-location";
import { FileTasks, FileTasksFragment } from "./sidebar/file-tasks";

export const FileSidebarFragment = graphql(
  `
    fragment FileSidebar on File {
      ...FileLocation
      ...FileTasks
      ...FileExif
    }
`,
  [FileLocationFragment, FileTasksFragment, FileExifFragment],
);

interface FileSidebarProps {
  file: FragmentOf<typeof FileSidebarFragment>;
}

export const FileSidebar: FC<FileSidebarProps> = ({ file: fileFrag }) => {
  const file = unmask(FileSidebarFragment, fileFrag);

  return (
    <div id="file-sidebar" className="space-y-3 h-min">
      <FileExif file={file} />
      <FileLocation file={file} />
      <FileTasks file={file} />
    </div>
  );
};
