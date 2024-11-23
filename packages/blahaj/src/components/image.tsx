import { useEffect, useMemo, useRef, useState, type CSSProperties, type FC } from "react";
import { graphql, unmask, type FragmentOf } from "../graphql";
import { cn } from "../helpers/cn";

const SOURCE_SET_SIZES = [800, 1600, 3200];

export const ImageFragment = graphql(`
  fragment Image on File {
    displayName
    thumbnailUrl
    preview
    info {
      height
      width
    }
  }
`);

interface ImageProps {
  isThumbnail?: boolean;
  file: FragmentOf<typeof ImageFragment>;
  style?: CSSProperties;
  draggable?: boolean;
  className?: string;
}

/**
 * Here be dragons:
 * - This component has been written more times than I can count, that is not an exaggeration.
 * - It looks simple but is not. It's working around multiple browser limitations.
 * - DO NOT ADD FADE-IN ANIMATIONS. For the love of all that is holy. It will break, lag the browser, have a dozen edge cases and will make your mum cry.
 * - DO NOT WRAP THE <img /> IN ANYTHING. A plain <img /> element is expected because parent comps might use special classes or wrappers that need a plain <img />.
 */
const ImageComponent: FC<ImageProps> = ({ file: fileFrag, className, draggable, style, isThumbnail }) => {
  const file = unmask(ImageFragment, fileFrag);
  const [preloaded, setPreloaded] = useState(false);
  const [preload, setPreload] = useState(false);
  const ref = useRef<HTMLImageElement | null>(null);

  const { source, useSourceSet } = useMemo(() => {
    if (!preloaded) {
      if (file.preview) return { source: `data:image/webp;base64,${file.preview}`, useSourceSet: false };
      return { source: undefined, useSourceSet: false };
    }

    return {
      source: file.thumbnailUrl || undefined,
      useSourceSet: true,
    };
  }, [file.preview, file.thumbnailUrl, preloaded]);

  const sourceSet = useMemo(() => {
    if (!file.thumbnailUrl || !file.info.width) return;
    const parts = [];
    for (const size of SOURCE_SET_SIZES) {
      if (size > file.info.width) break;
      if (isThumbnail) {
        parts.push(`${file.thumbnailUrl}?width=${size}&thumbnail=${isThumbnail} ${size}w`);
      } else {
        parts.push(`${file.thumbnailUrl}?width=${size} ${size}w`);
      }
    }

    if (!parts[0]) return undefined;
    return parts.join(", ");
  }, [file.thumbnailUrl, file.info.width, isThumbnail]);

  useEffect(() => {
    // preload the thumbnailUrl so we can swap it out
    if (!file.thumbnailUrl || !preload) return;
    const img = new Image();
    img.src = file.thumbnailUrl;
    if (sourceSet) img.srcset = sourceSet;
    img.onload = () => {
      setPreloaded(true);
    };

    // cached images don't trigger onload
    if (img.complete) {
      setPreloaded(true);
    }

    return () => {
      img.onload = null;
    };
  }, [file.thumbnailUrl, sourceSet, preload]);

  useEffect(() => {
    if (preloaded) return;
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPreload(true);
        }
      },
      { rootMargin: "50%" },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return (
    <img
      ref={ref}
      loading="lazy"
      decoding={preloaded ? "sync" : "async"} // if its async when we swap the image, it flickers
      className={cn("text-transparent", className)}
      alt={file.displayName}
      draggable={draggable}
      height={file.info.height || undefined}
      width={file.info.width || undefined}
      src={source}
      srcSet={useSourceSet ? sourceSet : undefined}
    />
  );
};

export { ImageComponent as Image };
