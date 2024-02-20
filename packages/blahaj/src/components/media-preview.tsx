import clsx from 'clsx';
import { forwardRef, type ComponentProps } from 'react';
import type { FilePartsFragment } from '../@generated/graphql';
import { Image } from './image';

export interface MediaPreviewProps extends ComponentProps<'a'> {
  file: FilePartsFragment;
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
  ({ file, height, width, ...rest }, ref) => {
    if (!height && file?.info.height) height = file.info.height;
    if (!width && file?.info.width) width = file.info.width;

    let proxyHeight, proxyWidth;
    if (file && height && width) {
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
      <a
        href={`/file/${file.id}`}
        data-mediaid={file.id}
        ref={ref}
        {...rest}
        className={clsx('transition relative overflow-hidden rounded-lg group', rest.className)}
      >
        <div className="transition opacity-0 pointer-events-none absolute inset-0 z-10 group-hover:opacity-100 bg-gradient-to-t from-black/90 via-transparent to-transparent">
          <div className="p-3 flex justify-end items-start h-full flex-col">
            <h3 className="max-w-full truncate">{file.name}</h3>
          </div>
        </div>
        {file?.info.durationFormatted && (
          <span className="absolute top-1 left-1 p-1 z-10 text-xs bg-black/70 rounded-lg">
            {file.info.durationFormatted}
          </span>
        )}
        <div key={file.id} className="h-full w-full overflow-hidden rounded">
          <Image
            src={file.thumbnailUrl!}
            previewBase64={file.previewBase64}
            height={height}
            width={width}
            className="h-full w-full object-cover bg-gray-200"
          />
        </div>
      </a>
    );
  },
);
