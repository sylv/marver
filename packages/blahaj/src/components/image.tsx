import { memo, useMemo, useState, type CSSProperties } from "react";
import { graphql, unmask, type FragmentType } from "../@generated";
import { cn } from "../helpers/cn";

const IMAGE_INNER_CLASSES = "text-transparent transition-opacity duration-200";
const SOURCE_SET_SIZES = [800, 1600, 3200];

const Fragment = graphql(`
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
  file: FragmentType<typeof Fragment>;
  style?: CSSProperties;
  draggable?: boolean;
  className?: string;
}

export const Image = memo<ImageProps>(({ file: fileFrag, className, draggable, style, isThumbnail }) => {
  const file = unmask(Fragment, fileFrag);
  const [showPreview, setShowPreview] = useState(true);
  const [unrenderPreview, setUnrenderPreview] = useState(false);
  const aspectRatio = useMemo(() => {
    if (!file.info.height || !file.info.width) return null;
    return file.info.width / file.info.height;
  }, [file]);

  const blurredUrl = useMemo(() => {
    if (!file.thumbnailTiny || !aspectRatio) return null;
    return `data:image/webp;base64,${file.thumbnailTiny}`;
  }, [file, aspectRatio]);

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

  // we want to scale up the image slightly to cover some ugly blurred edges, but
  // that breaks object-contain so we can't do it if its present.
  const canScale = !className?.includes("object-contain");

  return (
    <figure
      style={style}
      className={cn(
        "overflow-hidden", // chrome blurs image edges during transition, this hides it
        "rounded-md bg-accent relative",
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
        src={
          (file.thumbnailUrl && (isThumbnail ? `${file.thumbnailUrl}?thumbnail=true` : file.thumbnailUrl)) ||
          undefined
        }
        srcSet={sourceSet}
        draggable={draggable}
        ref={(img) => {
          if (!img) return;
          img
            .decode()
            .catch(() => null)
            .finally(() => {
              setShowPreview(false);
              setTimeout(() => {
                setUnrenderPreview(true);
              }, 200);
            });
        }}
      />
      {blurredUrl && !unrenderPreview && (
        <img
          aria-hidden
          alt=""
          height={file.info.height || undefined}
          width={file.info.width || undefined}
          src={blurredUrl}
          className={cn(
            IMAGE_INNER_CLASSES,
            "absolute top-0 left-0 right-0 bottom-0 pointer-events-none",
            showPreview ? "opacity-100" : "opacity-0",
            canScale && "scale-110", // todo: might be a performance issue
            className,
          )}
        />
      )}
    </figure>
  );
});
