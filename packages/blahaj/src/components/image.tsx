import { useMemo, type CSSProperties, type FC } from "react";
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
  }, [file]);

  const blurredUrl = useMemo(() => {
    if (!file.preview) return null;
    return `data:image/webp;base64,${file.preview}`;
  }, [file]);

  const canUsePreview = useMemo(() => {
    // this causes the image to "pop" in when its loaded
    // todo: this could be addressed if we can make the preview image the same height/width
    // as the final image so it can hold the space properly, but doing that is hard.
    if (className?.includes("-auto")) return false;
    // causes the preview image to not align properly
    if (
      (className?.includes("w-full") && !className.includes("h-full")) ||
      (className?.includes("h-full") && !className.includes("w-full"))
    )
      return false;
    // this causes issues with the preview image not aligning with the final image properly
    // we can use `backgroundSize: contain` to fix this, but for some images the edges
    // don't align and it looks sloppy.
    if (className?.includes("object-contain")) return false;
    return true;
  }, [className]);

  const styleWithPreview = !canUsePreview
    ? style
    : {
        ...style,
        backgroundImage: `url(${blurredUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      };

  return (
    <img
      loading="lazy"
      decoding="async"
      className={cn("text-transparent", className)}
      alt={file.displayName}
      draggable={draggable}
      height={file.info.height || undefined}
      width={file.info.width || undefined}
      src={file.thumbnailUrl || undefined}
      srcSet={sourceSet}
      style={styleWithPreview}
    />
  );
};
