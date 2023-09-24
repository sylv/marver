import { useApolloClient } from '@apollo/client';
import clsx from 'clsx';
import { forwardRef, useRef, type HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import {
  GetMediaDocument,
  type GetMediaQuery,
  type GetMediaQueryVariables,
  type MinimalMediaFragment,
} from '../@generated/graphql';
import { useMediaStore } from '../pages/media/media.store';
import { ImageLoader } from './image-loader';

export interface MediaPreviewProps extends HTMLAttributes<HTMLAnchorElement> {
  media: MinimalMediaFragment;
  height?: number;
  width?: number;
}

const PREVIEW_MAX_SIZE = 400;
const scaleDownImage = (height: number, width: number) => {
  const scale = PREVIEW_MAX_SIZE / Math.max(height, width);
  return {
    height: Math.floor(height * scale),
    width: Math.floor(width * scale),
  };
};

export const MediaPreview = forwardRef<HTMLAnchorElement, MediaPreviewProps>(
  ({ media, height, width, ...rest }, ref) => {
    const client = useApolloClient();
    const preloadTimeoutRef = useRef<number | undefined>(undefined);
    const filter = useMediaStore((state) => state.filter);

    if (!height && media?.height) height = media.height;
    if (!width && media?.width) width = media.width;

    let proxyHeight, proxyWidth;
    if (media && height && width) {
      // we need to scale down height+width to estimate the preview size
      const result = scaleDownImage(height, width);
      proxyHeight = result.height;
      proxyWidth = result.width;
    } else {
      proxyWidth = PREVIEW_MAX_SIZE;
    }

    const query = new URLSearchParams();
    query.set('width', proxyWidth.toString());
    if (proxyHeight) query.set('height', proxyHeight.toString());

    const onMouseEnter = () => {
      // preload the media information on hover
      // todo: this is actually pretty expensive to do,
      // because finding similar media is expensive to calculate
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }

      preloadTimeoutRef.current = window.setTimeout(() => {
        console.debug(`Preloading media ${media.file.id}`);
        client
          .query<GetMediaQuery, GetMediaQueryVariables>({
            query: GetMediaDocument,
            variables: {
              fileId: media.file.id,
              filter: filter,
            },
          })
          .catch((error) => {
            console.error('Error preloading media', error);
          });
      }, 100);
    };

    const onMouseExit = () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };

    return (
      <Link
        data-mediaid={media.file.id}
        to={`/media/${media.file.id}`}
        ref={ref}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseExit}
        {...rest}
        className={clsx('transition relative overflow-hidden rounded-lg group', rest.className)}
      >
        <div className="transition opacity-0 pointer-events-none absolute inset-0 z-10 group-hover:opacity-100 bg-gradient-to-t from-purple-600/90 to-transparent">
          <div className="p-3 flex justify-end items-start h-full flex-col">
            <span className="text-xs text-gray-400">{media.file.info.sizeFormatted}</span>
            <h3 className="max-w-full truncate">{media.file.name}</h3>
          </div>
        </div>
        {media?.durationFormatted && (
          <span className="absolute top-1 left-1 p-1 z-10 text-xs bg-black/70 rounded-lg">
            {media.durationFormatted}
          </span>
        )}
        <div key={media.file.id} className="h-full w-full overflow-hidden rounded">
          <ImageLoader
            src={media.thumbnailUrl!}
            previewBase64={media.previewBase64}
            height={height}
            width={width}
            className="h-full w-full object-cover bg-gray-200"
          />
        </div>
      </Link>
    );
  },
);
