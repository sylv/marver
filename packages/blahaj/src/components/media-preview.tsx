import clsx from 'clsx';
import { forwardRef, type HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { type MinimalMediaFragment } from '../@generated/graphql';
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

    return (
      <Link
        data-mediaid={media.file.id}
        to={`/media/${media.file.id}`}
        ref={ref}
        {...rest}
        className={clsx('transition relative overflow-hidden rounded-lg group', rest.className)}
      >
        <div className="transition opacity-0 pointer-events-none absolute inset-0 z-10 group-hover:opacity-100 bg-gradient-to-t from-black/90 via-transparent to-transparent">
          <div className="p-3 flex justify-end items-start h-full flex-col">
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
