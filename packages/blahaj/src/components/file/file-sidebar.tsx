import { memo } from "react";
import { graphql, unmask, type FragmentType } from "../../@generated";
import { FileList } from "./file-list";
import { FileExif } from "./sidebar/exif/file-exif";
import { FileLocation } from "./sidebar/file-location";
import { FileTasks } from "./sidebar/file-tasks";

const Frag = graphql(`
    fragment FileSidebarProps on File {
      ...FileLocationProps
      ...FileTasksProps
      ...FileExifProps
      similar(type: Related) {
        edges {
          ...FileListProps
        }
      }
    }
`);

interface FileSidebarProps {
  file: FragmentType<typeof Frag>;
}

export const FileSidebar = memo<FileSidebarProps>(({ file: fileFrag }) => {
  const file = unmask(Frag, fileFrag);

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
});
