import { FiFile } from 'react-icons/fi';
import { ImFileEmpty } from 'react-icons/im';
import { IoIosTimer, IoIosVideocam, IoIosVolumeHigh } from 'react-icons/io';
import { RxSize } from 'react-icons/rx';
import { useNavigate, useParams } from 'react-router-dom';
import { FileType, SimilarityType, useGetMediaQuery } from '../../@generated/graphql';
import { ImageOverlay } from '../../components/image-overlay';
import { Loading } from '../../components/loading';
import { Player } from '../../components/player/player';
import { SimilarMedia } from '../../components/similar-media';
import { setFilter, useMediaStore } from './media.store';
import { ImageLoader } from '../../components/image-loader';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import clsx from 'clsx';
import { formatNumber } from '../../helpers/format-number';

const splitTitleCase = (input: string) => {
  return input.replaceAll(/([A-Z]+)/g, ' $1').trim();
};

const TAG_COLOURS = [
  'text-red-500',
  'text-green-500',
  'text-blue-500',
  'text-yellow-500',
  'text-purple-500',
  'text-pink-500',
  'text-indigo-500',
  'text-red-400',
];

const TEMP_TAGS = [
  'cute',
  'animal',
  'mammal',
  'vertebrate',
  'genre:comedy',
  'genre:action',
  'genre:adventure',
  'genre:romance',
  'genre:horror',
  'artist:john_doe',
];

export default function File() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  if (!fileId) {
    navigate('/');
    return null;
  }

  const filter = useMediaStore((state) => state.filter);
  const { data, loading, error } = useGetMediaQuery({
    variables: {
      fileId: fileId,
      filter: filter,
    },
  });

  if (error) return <div>Oh no... {error.message}</div>;
  if (loading || !data?.media) return <Loading />;

  return (
    <div className="container mx-auto mt-10 space-y-2">
      <h1 className="text-xl font-semibold truncate">{data.media.file.name}</h1>
      <div className="flex flex-wrap gap-1">
        {TEMP_TAGS.map((tag, index) => {
          const colour = TAG_COLOURS[index % TAG_COLOURS.length];
          const fileCount = Math.floor(Math.random() * 10000);
          return (
            <button
              key={tag}
              className="bg-zinc-900 text-xs border rounded-full px-3 py-1 hover:bg-zinc-800 transition"
            >
              <span className={clsx(colour, 'font-semibold')}>{tag}</span>
              <span className="text-muted-foreground ml-1 text-xs">{formatNumber(fileCount)}</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-6 gap-2">
        <div className="col-span-5">
          <Card className="bg-zinc-900 overflow-hidden">
            {data.media.file.type === FileType.Video && data.media.thumbnailUrl && (
              <Player
                src={data.media.thumbnailUrl}
                height={data.media?.height || undefined}
                width={data.media?.width || undefined}
                hlsSrc={`/api/files/${fileId}/vidproxy/index.m3u8`}
                durationSeconds={data.media.durationSeconds || undefined}
                className="max-h-[60vh] h-full w-full object-contain"
              />
            )}
            {data.media.file.type === FileType.Image && data.media.thumbnailUrl && (
              <ImageLoader
                src={data.media.thumbnailUrl}
                height={data.media?.height || undefined}
                width={data.media?.width || undefined}
                previewBase64={data.media.previewBase64}
                className="max-h-[60vh] h-full w-full object-contain"
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
