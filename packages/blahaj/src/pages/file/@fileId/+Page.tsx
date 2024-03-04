import type { FC } from 'react';
import { useQuery } from 'urql';
import { FileDocument, FileType } from '../../../@generated/graphql';
import { Image } from '../../../components/image';
import { Player } from '../../../components/player/player';
import { SpinnerCenter } from '../../../components/spinner';
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
  if (fetching || !data?.file) return <SpinnerCenter />;

  return (
    <div className="container mx-auto mt-10 space-y-2">
      <h1 className="text-xl font-semibold truncate">{data.file.name}</h1>
      <Card className="bg-black overflow-hidden">
        {data.file.type === FileType.Video && data.file.thumbnailUrl && (
          <Player
            src={`/api/files/${fileId}/vidproxy/index.m3u8`}
            height={data.file?.info.height || undefined}
            width={data.file?.info.width || undefined}
            hlsSrc={`/api/files/${fileId}/vidproxy/index.m3u8`}
            durationSeconds={data.file.info.durationSeconds || undefined}
            className="max-h-[60vh] h-full w-full bg-black"
          />
        )}
        {data.file.type === FileType.Image && data.file.thumbnailUrl && (
          <Image file={data.file} className="max-h-[60vh] bg-black object-contain" />
        )}
      </Card>
    </div>
  );
};
