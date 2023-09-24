import React, { type FC, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { type BoundingBox } from '../@generated/graphql';
import { ImageLoader, type ImageLoaderProps } from './image-loader';

export interface ImageOverlayProps extends ImageLoaderProps {
  overlays?: ImageOverlayItem[];
}

interface ImageOverlayItem {
  boundingBox: BoundingBox;
  content: ReactNode;
  className?: string;
  onClick?: () => void;
}

function adjustBoundingBox(boundingBox: BoundingBox, scaleX: number, scaleY: number): BoundingBox {
  return {
    x1: boundingBox.x1 * scaleX,
    x2: boundingBox.x2 * scaleX,
    y1: boundingBox.y1 * scaleY,
    y2: boundingBox.y2 * scaleY,
  };
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
    <div className="relative">
      <ImageLoader {...rest} ref={imageRef} onLoad={calculateScale} onError={calculateScale} />
      <div className="absolute inset-0 pointer-events-none">
        {scaleX !== null &&
          scaleY !== null &&
          overlays?.map((overlay, index) => {
            const As = overlay.onClick ? 'button' : 'div';
            const adjustedBoundingBox = adjustBoundingBox(overlay.boundingBox, scaleX, scaleY);
            return (
              <As
                className={overlay.className}
                onClick={overlay.onClick}
                key={`${adjustedBoundingBox.x1}-${adjustedBoundingBox.y1}.${index}`}
                title={overlay.content || undefined}
                style={{
                  position: 'absolute',
                  pointerEvents: 'auto',
                  left: `${adjustedBoundingBox.x1}px`,
                  top: `${adjustedBoundingBox.y1}px`,
                  width: `${adjustedBoundingBox.x2 - adjustedBoundingBox.x1}px`,
                  height: `${adjustedBoundingBox.y2 - adjustedBoundingBox.y1}px`,
                }}
              >
                {overlay.content}
              </As>
            );
          })}
      </div>
    </div>
  );
};
