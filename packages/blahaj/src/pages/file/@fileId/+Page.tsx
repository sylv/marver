import type { FC } from 'react';
import { useQuery } from 'urql';
import { FileDocument, FileType } from '../../../@generated/graphql';
import { ImageOverlay } from '../../../components/image-overlay';
import { Loading } from '../../../components/loading';
import { Player } from '../../../components/player/player';
import { Card } from '../../../components/ui/card';
import type { PageProps } from '../../../renderer/types';
import { useMediaStore } from './media.store';

export const Page: FC<PageProps> = ({ routeParams }) => {
  const fileId = routeParams.fileId!;
  const filter = useMediaStore((state) => state.filter);
  const [{ data, fetching, error }] = useQuery({
    query: FileDocument,
    variables: {
      fileId: fileId,
      filter: filter,
    },
  });

  if (error) return <div>Oh no... {error.message}</div>;
  if (fetching || !data?.file) return <Loading />;

  return (
    <div className="container mx-auto mt-10 space-y-2">
      <h1 className="text-xl font-semibold truncate">{data.file.name}</h1>
      <div className="grid grid-cols-6 gap-2">
        <div className="col-span-5">
          <Card className="bg-zinc-900 overflow-hidden">
            {data.file.type === FileType.Video && data.file.thumbnailUrl && (
              <Player
                src={data.file.thumbnailUrl}
                height={data.file?.info.height || undefined}
                width={data.file?.info.width || undefined}
                hlsSrc={`/api/files/${fileId}/vidproxy/index.m3u8`}
                durationSeconds={data.file.info.durationSeconds || undefined}
                className="max-h-[60vh] h-full w-full object-contain"
              />
            )}
            {data.file.type === FileType.Image && data.file.thumbnailUrl && (
              <ImageOverlay
                src={data.file.thumbnailUrl}
                height={data.file.info?.height || undefined}
                width={data.file.info?.width || undefined}
                previewBase64={data.file.previewBase64}
                className="max-h-[60vh] h-full w-full object-contain"
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
