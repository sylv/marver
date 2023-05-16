import { RefObject, useEffect, useMemo, useState } from 'react';
import { MinimalMediaFragment } from '../generated/graphql';

export interface ImageLike<T> {
  height: number;
  width: number;
  data: T;
}

export interface RowOptions {
  containerWidth: number;
  rowHeight: number;
  margin: number;
  maxPerRow?: number;
}

export interface RowifiedImage<T> {
  scaledHeight: number;
  scaledWidth: number;
  data: T;
}

const getRow = <T>(images: ImageLike<T>[], options: RowOptions): RowifiedImage<T>[] => {
  let remainingWidth = options.containerWidth;
  const maxImageWidth = options.containerWidth / 2;
  const imagesForRow = [];
  for (const image of images) {
    // we scale the images twice. first an initial scale so the aspect
    // ratio is maintained when we squash them down to meet the row height.
    const scale = options.rowHeight / image.height;
    const scaledWidth = Math.min(image.width * scale, image.width);
    if (imagesForRow[1] && scaledWidth > maxImageWidth && imagesForRow.length > 0) {
      // we can't fit this image in the row, so we'll just stop here and
      // it can be picked up in the next one
      break;
    }

    imagesForRow.push({
      scaledHeight: options.rowHeight,
      scaledWidth: Math.floor(scaledWidth),
      data: image.data,
    });

    remainingWidth -= scaledWidth;
    if (remainingWidth < 0) break;
    if (options.maxPerRow && imagesForRow.length >= options.maxPerRow) break;
  }

  const marginLoss = options.margin * imagesForRow.length * 2;
  const scale = (options.containerWidth - marginLoss) / (options.containerWidth - remainingWidth);
  return imagesForRow.map((image) => ({
    scaledHeight: options.rowHeight,
    scaledWidth: Math.floor(image.scaledWidth * scale),
    data: image.data,
  }));
};

export const getRows = <T>(images: ImageLike<T>[], options: RowOptions): RowifiedImage<T>[] => {
  const rows = [];
  while (images.length > 0) {
    const row = getRow(images, options);
    rows.push(...row);
    images = images.slice(row.length);
  }

  return rows;
};

export const useMediaListRows = (
  mediaList: MinimalMediaFragment[] | undefined | null,
  options: Omit<RowOptions, 'containerWidth'> & { containerRef: RefObject<HTMLDivElement> }
): RowifiedImage<MinimalMediaFragment>[] => {
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!options.containerRef.current) return;
    const container = options.containerRef.current;
    setContainerWidth(container.clientWidth);
    const listener = () => {
      setContainerWidth(container.clientWidth);
    };

    window.addEventListener('resize', listener);
    return () => {
      window.removeEventListener('resize', listener);
    };
  }, [options.containerRef.current]);

  return useMemo(() => {
    if (!mediaList) return [];
    if (!containerWidth) return [];
    const formattedMediaList = mediaList.map((media) => ({
      height: media.height ?? 400,
      width: media.width ?? 400,
      data: media,
    }));

    return getRows(formattedMediaList, {
      ...options,
      containerWidth,
    });
  }, [mediaList, options]);
};
