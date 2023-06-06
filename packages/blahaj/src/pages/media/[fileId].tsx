import React, { useEffect, useState } from 'react';
import { FiFile } from 'react-icons/fi';
import { ImFileEmpty } from 'react-icons/im';
import { IoIosTimer, IoIosVideocam, IoIosVolumeHigh } from 'react-icons/io';
import { RxSize } from 'react-icons/rx';
import { useNavigate, useParams } from 'react-router-dom';
import { useBackgroundColours } from '../../components/background';
import { ImageLoader } from '../../components/image-loader';
import { Loading } from '../../components/loading';
import { Player } from '../../components/player/player';
import { SimilarMedia } from '../../components/similar-media';
import { FileType, SimilarityType, useGetMediaQuery } from '../../generated/graphql';
import { thumbhashBase64ToDataUri } from '../../helpers/thumbhashBase64ToDataUri';
import { setFilter, useMediaStore } from './media.store';
import { ImageOverlay } from '../../components/image-overlay';

const splitTitleCase = (input: string) => {
  return input.replace(/([A-Z]+)/g, ' $1').trim();
};

export default function File() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  if (!fileId) {
    navigate('/');
    return null;
  }

  const filter = useMediaStore((state) => state.filter);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [{ data, fetching, error }] = useGetMediaQuery({
    variables: {
      fileId: fileId,
      filter: filter,
    },
  });

  useEffect(() => {
    if (!data?.media?.previewBase64) return;
    const url = thumbhashBase64ToDataUri(data.media.previewBase64);
    if (url) {
      setBackgroundUrl(url);
    }
  }, [data?.media?.previewBase64]);

  useBackgroundColours(backgroundUrl);

  if (error) return <div>Oh no... {error.message}</div>;
  if (fetching || !data?.media) return <Loading />;

  return (
    <div className="container mx-auto flex gap-3 mt-3">
      <div className="w-full h-full flex flex-col gap-3">
        <div className="relative h-[70vh] w-full flex items-center justify-center bg-gray-600/30 rounded-lg">
          {data.media.file.type === FileType.Video && (
            <Player
              src={`/api/files/${fileId}/raw`}
              hlsSrc={`/api/files/${fileId}/vidproxy/index.m3u8`}
              className="w-auto rounded-lg h-full"
              height={data.media?.height || undefined}
              width={data.media?.width || undefined}
              hasAudio={!!data.media?.audioCodec}
              poster={data.media?.thumbnailUrl || undefined}
            >
              {data.media.subtitles.map((subtitle) => (
                <track
                  key={subtitle.id}
                  src={`/api/subtitles/${subtitle.id}`}
                  kind="subtitles"
                  label={subtitle.displayName}
                />
              ))}
            </Player>
          )}
          {/* {data.media.file.type === FileType.Image && data.media.thumbnailUrl && (
            <ImageLoader
              src={data.media.thumbnailUrl}
              height={data.media?.height || undefined}
              width={data.media?.width || undefined}
              previewBase64={data.media.previewBase64}
              className="h-full w-full object-contain"
            />
          )} */}
          {data.media.file.type === FileType.Image && data.media.thumbnailUrl && (
            <ImageOverlay
              src={data.media.thumbnailUrl}
              height={data.media?.height || undefined}
              width={data.media?.width || undefined}
              previewBase64={data.media.previewBase64}
              className="h-[70vh] w-full object-contain"
              overlays={data.media.faces.map((face) => ({
                boundingBox: face.boundingBox,
                content: face.id,
                className: 'border border-red-600 text-red-600 truncate font-mono bg-red-400/40',
              }))}
            />
          )}
        </div>
        <div className="rounded-lg p-3 bg-gray-600/30">
          <h1 className="font-semibold text-lg" title={data.media.file.path}>
            {data.media.file.name}
          </h1>
          <div className="flex gap-2 mt-1 text-xs text-gray-400">
            <span className="flex gap-1 items-center">
              <FiFile />
              {data.media.file.metadata.sizeFormatted} {data.media.file.type?.toLowerCase()}
            </span>
            {data.media?.width && data.media?.height && (
              <span className="flex gap-1 items-center">
                <RxSize />
                {data.media?.width}x{data.media?.height}
              </span>
            )}
            {data.media?.durationFormatted && (
              <span className="flex gap-1 items-center">
                <IoIosTimer />
                {data.media.durationFormatted}
              </span>
            )}
            {data.media?.videoCodec && (
              <span className="flex gap-1 items-center">
                <IoIosVideocam />
                {data.media.videoCodec}
              </span>
            )}
            {data.media?.audioCodec && (
              <span className="flex gap-1 items-center">
                <IoIosVolumeHigh />
                {data.media.audioCodec}
              </span>
            )}
          </div>
          <div id="tags" className="flex gap-2 mt-2">
            <button className="bg-red-500/40 text-sm lowercase p-1 rounded">important tag</button>
            <button className="bg-purple-500/40 text-sm lowercase p-1 rounded">artist name idk</button>
            <button className="bg-dark-100/30 text-sm lowercase p-1 rounded">cool</button>
            <button className="bg-dark-100/30 text-sm lowercase p-1 rounded">poggers tag</button>
            <button className="bg-dark-100/30 text-sm lowercase p-1 rounded">balls</button>
          </div>
        </div>
      </div>
      <div className="w-[25em]">
        <div className="grid grid-cols-3 mb-2 gap-1">
          {Object.keys(SimilarityType).map((key) => (
            <button
              className="flex-grow bg-gray-600/30 rounded p-1 text-sm text-gray-400 hover:bg-gray-600/40 px-2 truncate"
              key={key}
              onClick={() => setFilter(SimilarityType[key as keyof typeof SimilarityType])}
            >
              {splitTitleCase(key)}
            </button>
          ))}
        </div>
        {data.media.similar.edges[0] && (
          <SimilarMedia similarFiles={data.media.similar.edges.map((edge) => edge.node)} />
        )}
        {!data.media.similar.edges[0] && (
          <div className="bg-gray-600/30 p-8 text-gray-400 text-center rounded-lg">
            <ImFileEmpty className="text-gray-500 text-4xl mx-auto" />
            <h1 className="text-sm mt-4">No similar files found</h1>
          </div>
        )}
      </div>
    </div>
  );
}
