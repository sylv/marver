import type { FC } from 'react';
import { useQuery } from 'urql';
import { graphql } from '../../../@generated';
import { FileType } from '../../../@generated/graphql';
import { FileExif } from '../../../components/file/sidebar/exif/file-exif';
import { FileLocation } from '../../../components/file/sidebar/file-location';
import { FileTasks } from '../../../components/file/sidebar/file-tasks';
import { Image } from '../../../components/image';
import { Player } from '../../../components/player/player';
import { SpinnerCenter } from '../../../components/spinner';
import { Card } from '../../../components/ui/card';
import type { PageProps } from '../../../renderer/types';
import { useMediaStore } from './media.store';

const FileQuery = graphql(`
  query File($fileId: String!) {
    file(id: $fileId) {
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
  }
`);

export const Page: FC<PageProps> = ({ routeParams }) => {
  const fileId = routeParams.fileId!;
  const filter = useMediaStore((state) => state.filter);
  const [{ data, fetching, error }] = useQuery({
    query: FileQuery,
    variables: {
      fileId: fileId,
      filter: filter,
    },
  });

  if (error) return <div>Oh no... {error.message}</div>;
  if (fetching || !data?.file) return <SpinnerCenter />;

  return (
    <div className="container mx-auto mt-10 space-y-2">
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-3 space-y-3">
          <Card className="text-xl font-semibold truncate bg-zinc-900 px-3 py-1">
            <h1>{data.file.name}</h1>
          </Card>
          <Card className="bg-black overflow-hidden h-min">
            {data.file.type === FileType.Video && data.file.thumbnailUrl && (
              <Player
                src={`/api/files/${fileId}/raw`}
                hlsSrc={`/api/files/${fileId}/vidproxy/index.m3u8`}
                height={data.file?.info.height || undefined}
                width={data.file?.info.width || undefined}
                durationSeconds={data.file.info.durationSeconds || undefined}
                className="max-h-[60vh] h-full w-full bg-black"
              />
            )}
            {data.file.type === FileType.Image && data.file.thumbnailUrl && (
              <Image file={data.file} className="max-h-[60vh] bg-black object-contain w-full" />
            )}
          </Card>
        </div>
        <div id="file-sidebar" className="space-y-3">
          <FileExif file={data.file} />
          <FileLocation file={data.file} />
          <FileTasks file={data.file} />
        </div>
      </div>
    </div>
  );
};
