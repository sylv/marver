/* eslint-disable jsx-a11y/alt-text */
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { forwardRef, memo, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { cn } from '../helpers/cn';
import { thumbhashBase64ToDataUri } from '../helpers/thumbhashBase64ToDataUri';

export interface ImageLoaderProps extends ComponentProps<typeof motion.img> {
  previewBase64: string | undefined | null;
}

// this is a static image that is used for images with no previewBase64
// it's an image so we can still use an image element, which simplifies everything
// compared to using a div and breaking compatibility with things like object-contain
const DEFAULT_PLACEHOLDER_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjcHZ2+g8AA10ByPnEYasAAAAASUVORK5CYII=';

const SIZES = [100, 200, 400, 800, 1600, 3200];

/**
 * The ImageLoader component handles loading images smoothly.
 * If previewBase64 is provided, it will be used as a placeholder while the image loads.
 * Otherwise, a static pulsing dark image will be used.
 */
export const Image = memo(
  forwardRef<HTMLImageElement, ImageLoaderProps>(
    ({ previewBase64, src, height, width, ...rest }, imageRefOuter) => {
      const [loaded, setLoaded] = useState(false);
      const imageRef = useRef<HTMLImageElement | null>(null);
      const aspectRatio = useMemo(() => {
        if (typeof height !== 'number' || typeof width !== 'number') {
          if (rest.className?.includes('object-cover')) {
            // if we don't give it an aspect ratio, the preview image size
            // does not match the final aspect ratio 1:1, which causes a flash
            // https://github.com/evanw/thumbhash/issues/31
            throw new Error('ImageLoader with object-cover must have a fixed width and height');
          }

          return;
        }

        return width / height;
      }, [height, width, rest.className]);

      const previewUri = useMemo(() => {
        if (previewBase64) return thumbhashBase64ToDataUri(previewBase64, aspectRatio);
        // with no previewBase64, we use a black image + animate-pulse to create a
        // loading effect WITHOUT massively breaking things like object-contain and object-cover
        return DEFAULT_PLACEHOLDER_IMAGE;
      }, [previewBase64, aspectRatio]);

      const isPreviewBlack = previewUri === DEFAULT_PLACEHOLDER_IMAGE;

      const srcSet = useMemo(() => {
        if (!src || !src.includes('/imgproxy/')) return;
        if (!width) return;
        if (typeof width === 'string') {
          console.warn(
            `Image width is a string, which disables srcset optimization. If possible, use a fixed number instead.`,
          );
          return;
        }

        const parts = [];
        for (const size of SIZES) {
          if (size > width) break;
          parts.push(`${src}?width=${size} ${size}w`);
        }

        return parts.join(', ');
      }, [src, width]);

      useEffect(() => {
        if (!imageRef.current) return;
        if (imageRef.current.src && imageRef.current.complete) {
          setLoaded(true);
        }
      }, [imageRef]);

      return (
        <figure className="inline relative z-0">
          <motion.img
            {...rest}
            src={src}
            srcSet={srcSet}
            loading="lazy"
            height={height}
            width={width}
            animate={loaded ? 'visible' : 'hidden'}
            transition={{ duration: 0.3 }}
            initial={{ opacity: 0 }}
            className={clsx(rest.className, 'will-change-auto relative z-10')}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            ref={(el) => {
              imageRef.current = el;
              if (imageRefOuter) {
                if (typeof imageRefOuter === 'function') {
                  imageRefOuter(el);
                } else {
                  imageRefOuter.current = el;
                }
              }
            }}
            onLoad={() => setLoaded(true)}
          />
          {previewUri && (
            <motion.img
              aria-hidden
              src={previewUri}
              height={height}
              width={width}
              className={cn(
                rest.className,
                'absolute top-0 bottom-0 left-0 right-0',
                isPreviewBlack && 'animate-pulse',
              )}
            />
          )}
        </figure>
      );
    },
  ),
);
