import { useEffect, useMemo, useRef, useState, type CSSProperties, type FC } from "react";
import { graphql, unmask, type FragmentOf } from "../graphql";
import { cn } from "../helpers/cn";

// fewer sizes increases the chance of a cache hit
const SOURCE_SET_SIZES = [800, 1600, 3200];

export const ImageFragment = graphql(`
  fragment Image on File {
    id
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
  const ref = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hidePreview, setHidePreview] = useState(false);

  useEffect(() => {
    // if the file changes, swap the image to the preview image
    setImageLoaded(false);
    setHidePreview(false);
  }, [file.id]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.decode().then(() => {
      setImageLoaded(true);
      setTimeout(() => setHidePreview(true), 200);
    });
  }, [ref]);

  // const usePreviewImage = file.preview && !previewLoaded;
  // const usePreviewImage = false;
  // const source = usePreviewImage ? `data:image/webp;base64,${file.preview}` : file.thumbnailUrl || undefined;
  const source = file.thumbnailUrl || undefined;
  const previewImage = file.preview ? `data:image/webp;base64,${file.preview}` : undefined;

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

  // if the parent decides height and width using classes, it conflicts with the way
  // we define the height/width in styles to avoid layout shift. this works around that
  const hasHeight = className?.includes(" h-");
  const hasWidth = className?.includes(" w-");
  // this avoids layout shift by setting the height/width of the image
  // for some reason doing this other ways results in layout shift. using srcset also causes that
  const baseStyle: CSSProperties = {};
  if (!hasHeight && file.info.height) baseStyle.height = file.info.height;
  if (!hasWidth && file.info.height) baseStyle.width = "100%";
  if (file.info.width && file.info.height) baseStyle.aspectRatio = `${file.info.width}/${file.info.height}`;

  const core = (
    <img
      ref={ref}
      loading="lazy"
      decoding="async"
      className={cn("text-transparent bg-zinc-900", className)}
      alt={file.displayName}
      draggable={draggable}
      src={source}
      srcSet={sourceSet}
      onLoad={() => setImageLoaded(true)}
      style={{
        ...baseStyle,
        ...style,
      }}
    />
  );

  if (!previewImage) return core;

  return (
    <span className="relative inline">
      {!hidePreview && (
        <img
          src={previewImage}
          className={cn(
            "absolute pointer-events-none duration-200 max-w-full max-h-full",
            "will-change-[opacity] scale-[1.3]", // will-change-opacity makes the image have fuzzy borders, scale hides them
            imageLoaded ? "opacity-0" : "opacity-100",
            className,
          )}
          alt={file.displayName}
          style={{
            ...baseStyle,
            ...style,
          }}
        />
      )}
      {core}
    </span>
  );
};

export { ImageComponent as Image };
