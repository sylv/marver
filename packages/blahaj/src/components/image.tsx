import { memo, useEffect, useMemo, useState, type CSSProperties } from "react";
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
 * - Using a background image for the preview and not changing the source bloats the HTML because of the sourcesets and
 * causes issues with object-fit/dynamic images.
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

  // we start with the blurred source, then switch to the real source
  // the browser wont clear the blurred preview while the real source loads, so this works well.
  const [useSource, setUseSource] = useState(!blurredUrl);
  useEffect(() => setUseSource(true), []);
  const useBlurred = blurredUrl && !useSource;
  const source = useBlurred ? blurredUrl : file.thumbnailUrl;

  if (className?.includes("-auto")) {
    // todo: im not sure why this happens, but for some images the preview becomes smaller than
    // the image so when its replaced it looks like ass.
    // instead of throwing, just not using the preview might be a better option but i think that would
    // mean a degraded experience when its forgotten about.
    throw new Error(`"h-auto" or "w-auto" break the blurred image preview.`);
  }

  return (
    <img
      // this has to be "eager" for blurred previews or else we'll swap out the URL before the
      // preview is put into the image, causing the preview to never load.
      loading={useBlurred ? "eager" : "lazy"}
      decoding={useBlurred ? "sync" : "async"}
      className={cn("text-transparent", className)}
      alt={file.name}
      draggable={draggable}
      height={file.info.height || undefined}
      width={file.info.width || undefined}
      src={source || undefined}
      srcSet={useBlurred ? undefined : sourceSet}
      style={style}
    />
  );
});
