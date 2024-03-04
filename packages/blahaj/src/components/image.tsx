import { memo, useMemo, useState, type CSSProperties } from 'react';
import type { FilePartsFragment } from '../@generated/graphql';
import { cn } from '../helpers/cn';
import { thumbhashBase64ToDataUri } from '../helpers/thumbhashBase64ToDataUri';

const IMAGE_INNER_CLASSES = 'text-transparent transition-opacity duration-200';
const SOURCE_SET_SIZES = [800, 1600, 3200];

interface ImageProps {
  file: FilePartsFragment;
  style?: CSSProperties;
  className?: string;
}

export const Image = memo<ImageProps>(({ file, className, style }) => {
  const [loaded, setLoaded] = useState(false);
  const [decoded, setDecoded] = useState(false);
  const aspectRatio = useMemo(() => {
    if (!file.info.height || !file.info.width) return null;
    return file.info.width / file.info.height;
  }, [file]);

  const previewUrl = useMemo(() => {
    if (!file.previewBase64 || !aspectRatio) return null;
    return thumbhashBase64ToDataUri(file.previewBase64, aspectRatio);
  }, [file, aspectRatio]);

  const sourceSet = useMemo(() => {
    if (!file.thumbnailUrl || !file.info.width) return;
    const parts = [];
    for (const size of SOURCE_SET_SIZES) {
      if (size > file.info.width) break;
      parts.push(`${file.thumbnailUrl}?width=${size} ${size}w`);
    }

    return parts.join(', ');
  }, [file]);

  // the hack we use to scale the images slightly larger only works if the image overflow is not visible.
  // with object-cover it is visible and so the scale hack looks weird - the preview is 1.25x larger,
  // so when it swaps to the image, it looks like it shrinks.
  const scalePreview = !className?.includes('object-contain');

  return (
    <figure
      style={style}
      className={cn(
        'overflow-hidden', // chrome blurs image edges during transition, this hides it
        'rounded-md bg-accent relative',
        className,
      )}
    >
      <img
        loading="lazy"
        decoding="async"
        className={cn(IMAGE_INNER_CLASSES, className)}
        alt={file.name}
        height={file.info.height || undefined}
        width={file.info.width || undefined}
        src={file.thumbnailUrl || undefined}
        srcSet={sourceSet}
        onLoad={() => setLoaded(true)}
        ref={(img) => {
          // using onLoad() is good, but doesn't fire if the image is cached.
          // using `image.complete` is good, but using `decoding=async` can cause the preview to hide before the image is loaded.
          // decode() resolves only when the image is decoded, so it's the best of both worlds.
          if (!img) return;
          if (img.complete) setLoaded(true);
          img
            .decode()
            // decode() in firefox with srcSet throws an error, idk why.
            // thats also why there is `loaded` and `decoded` states,
            // otherwise it causes jank on firefox.
            .catch(() => null)
            .finally(() => {
              setDecoded(true);
            });
        }}
      />
      {previewUrl && (
        <img
          aria-hidden
          alt=""
          height={file.info.height || undefined}
          width={file.info.width || undefined}
          src={previewUrl}
          className={cn(
            IMAGE_INNER_CLASSES,
            'absolute top-0 left-0 right-0 bottom-0 pointer-events-none will-change-[opacity]',
            scalePreview && 'scale-125', // fixes some rendering issues with blurry edges or the preview not covering the image fully.
            loaded && decoded ? 'opacity-0' : 'opacity-100',
            className,
          )}
        />
      )}
    </figure>
  );
});
