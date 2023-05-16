import clsx from 'clsx';
import React, { ImgHTMLAttributes, memo, useEffect, useMemo, useRef } from 'react';
import { thumbhashBase64ToDataUri } from '../helpers/thumbhashBase64ToDataUri';
import useCurrentState from '../hooks/useCurrentState';

export interface ImageLoaderProps extends ImgHTMLAttributes<HTMLImageElement> {
  previewBase64: string | undefined | null;
}

// this is a static image that is used for images with no previewBase64
// it's an image so we can still use an iamge element, which simplifies everything
// compared to using a div and breaking compatibility with things like object-contain
const DEFAULT_PLACEHOLDER_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjcHZ2+g8AA10ByPnEYasAAAAASUVORK5CYII=';

/**
 * The ImageLoader component handles loading images smoothly.
 * If previewBase64 is provided, it will be used as a placeholder while the image loads.
 * Otherwise, a static pulsing dark image will be used.
 *
 * This should be a drop-in replacement for <img />.
 * If it is not, that is considered a bug.
 */
export const ImageLoader = memo<ImageLoaderProps>(({ previewBase64, src, height, width, ...rest }) => {
  const [loaded, setLoaded, loadedRef] = useCurrentState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewUri = useMemo(() => {
    if (previewBase64) {
      return thumbhashBase64ToDataUri(previewBase64);
    }

    // with no previewBase64, we create a black image of the same dimensions
    // and use that + animate-pulse to create a loading effect WITHOUT
    // massively breaking things like object-contain and object-cover
    return DEFAULT_PLACEHOLDER_IMAGE;
  }, [previewBase64, height, width]);

  useEffect(() => {
    setLoaded(false);
    if (!src) return;
    const image = new Image();
    image.onload = () => setLoaded(true);
    image.src = src;
  }, [src]);

  const useSrc = loaded ? src : previewUri;
  const isBlackImage = useSrc === DEFAULT_PLACEHOLDER_IMAGE;

  return (
    <img
      {...rest}
      className={clsx(rest.className, isBlackImage && 'animate-pulse')}
      src={useSrc}
      ref={imageRef}
      height={height}
      width={width}
    />
  );
});
