import { memo, useMemo, type CSSProperties } from "react";
import { graphql, unmask, type FragmentType } from "../@generated";
import { cn } from "../helpers/cn";

const SOURCE_SET_SIZES = [800, 1600, 3200];

const Frag = graphql(`
  fragment ImageProps on File {
    name
    thumbnailUrl
    thumbnailTiny
    info {
      height
      width
    }
  }
`);

interface ImageProps {
  isThumbnail?: boolean;
  file: FragmentType<typeof Frag>;
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
export const Image = memo<ImageProps>(({ file: fileFrag, className, draggable, style, isThumbnail }) => {
  const file = unmask(Frag, fileFrag);
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
    if (!file.thumbnailTiny) return null;
    return `data:image/webp;base64,${file.thumbnailTiny}`;
  }, [file]);

  const isObjectContain = className?.includes("object-contain");

  return (
    <img
      loading="lazy"
      decoding="async"
      className={cn("bg-zinc-800", className)}
      alt={file.name}
      draggable={draggable}
      height={file.info.height || undefined}
      width={file.info.width || undefined}
      src={file.thumbnailUrl || undefined}
      srcSet={sourceSet}
      style={{
        ...style,
        backgroundImage: blurredUrl ? `url(${blurredUrl})` : undefined,
        backgroundSize: isObjectContain ? "contain" : "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
});
