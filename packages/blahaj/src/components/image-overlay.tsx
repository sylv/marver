import { Fragment, useCallback, useEffect, useRef, useState, type FC } from 'react';
import { type BoundingBox } from '../@generated/graphql';
import { Image, type ImageLoaderProps } from './image';

export interface ImageOverlayProps extends ImageLoaderProps {
  overlays?: ImageOverlayItem[];
}

interface ImageOverlayItem {
  boundingBox: BoundingBox;
  content: string;
  className?: string;
  onClick?: () => void;
}

export const ImageOverlay: FC<ImageOverlayProps> = ({ overlays, ...rest }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [scaleX, setScaleX] = useState<number | null>(null);
  const [scaleY, setScaleY] = useState<number | null>(null);

  const calculateScale = useCallback(() => {
    // todo: object-contain breaks this calculation, and will make the overlay
    // alignment off. the only fix for that is to check if object-contain is being used and
    // when it is, manually calculate where the image actually is on screen and use that instead.
    // https://stackoverflow.com/questions/65807122/how-get-image-pixel-coordinate-with-object-fit-contain
    if (!imageRef.current) return;
    const isLoaded = imageRef.current.complete && imageRef.current.naturalHeight !== 0;
    if (!isLoaded) return;

    const { naturalWidth, naturalHeight } = imageRef.current;
    const { width, height } = imageRef.current.getBoundingClientRect();
    const scaleX = width / naturalWidth;
    const scaleY = height / naturalHeight;
    setScaleX(scaleX);
    setScaleY(scaleY);
  }, [imageRef.current]);

  useEffect(() => {
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => {
      window.removeEventListener('resize', calculateScale);
    };
  }, [calculateScale]);

  return (
    <Fragment>
      <Image {...rest} ref={imageRef} onLoad={calculateScale} onError={calculateScale} />
      <div className="absolute inset-0 pointer-events-none">
        {scaleX !== null &&
          scaleY !== null &&
          overlays?.map((overlay, index) => {
            const As = overlay.onClick ? 'button' : 'div';

            // bounding box is relative to the image, 0-1
            return (
              <As
                className={overlay.className}
                onClick={overlay.onClick}
                key={`${overlay.boundingBox.x1}-${overlay.boundingBox.y1}.${index}`}
                title={overlay.content || undefined}
                style={{
                  position: 'absolute',
                  pointerEvents: 'auto',
                  left: `${overlay.boundingBox.x1 * 100}%`,
                  top: `${overlay.boundingBox.y1 * 100}%`,
                  width: `${(overlay.boundingBox.x2 - overlay.boundingBox.x1) * 100}%`,
                  height: `${(overlay.boundingBox.y2 - overlay.boundingBox.y1) * 100}%`,
                }}
              >
                {overlay.content}
              </As>
            );
          })}
      </div>
    </Fragment>
  );
};
