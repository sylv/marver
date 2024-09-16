import type { FC } from "react";
import { FileList, FileListFragment } from "./file-list";
import { FileExif, FileExifFragment } from "./sidebar/exif/file-exif";
import { FileLocation, FileLocationFragment } from "./sidebar/file-location";
import { FileTasks, FileTasksFragment } from "./sidebar/file-tasks";
import { graphql, unmask, type FragmentOf } from "../../graphql";

export const FileSidebarFragment = graphql(
  `
    fragment FileSidebar on File {
      ...FileLocation
      ...FileTasks
      ...FileExif
      similar(type: Related) {
        edges {
          ...FileList
        }
      }
    }
`,
  [FileLocationFragment, FileTasksFragment, FileExifFragment, FileListFragment],
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
      <div className="overflow-y-auto">
        <FileList files={file.similar.edges} targetWidth={100} />
      </div>
    </div>
  );
};
