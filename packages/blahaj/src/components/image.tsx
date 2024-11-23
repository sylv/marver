import { useEffect, useMemo, useState, type CSSProperties, type FC } from "react";
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
export const Image: FC<ImageProps> = ({ file: fileFrag, className, draggable, style, isThumbnail }) => {
  const file = unmask(ImageFragment, fileFrag);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const blurredUrl = useMemo(() => {
    if (!file.preview) return null;
    return `data:image/webp;base64,${file.preview}`;
  }, [file]);

  const source = useMemo(() => {
    if (blurredUrl && !isClient) return blurredUrl;
    return file.thumbnailUrl || undefined;
  }, [isClient, blurredUrl, file.thumbnailUrl]);

  const sourceSet = useMemo(() => {
    if (!isClient) return;
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
  }, [isClient, file.thumbnailUrl, file.info.width, isThumbnail]);

  return (
    <img
      loading="lazy"
      // decoding="async" // causes the image to "flash" when it switches from the blurred image to the final image
      className={cn("text-transparent", className)}
      alt={file.displayName}
      draggable={draggable}
      height={file.info.height || undefined}
      width={file.info.width || undefined}
      src={source}
      srcSet={sourceSet}
      // style={styleWithPreview}
    />
  );
};
