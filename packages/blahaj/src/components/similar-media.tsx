import React, { memo, useRef } from 'react';
import { type MinimalMediaFragment } from '../@generated/graphql';
import { useMediaListRows } from '../helpers/getRows';
import { MediaPreview } from './media-preview';

const MARGIN = 4;

interface SimilarMediaProps {
  similarFiles: MinimalMediaFragment[];
}

export const SimilarMedia = memo<SimilarMediaProps>(({ similarFiles }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const layout = useMediaListRows(similarFiles, {
    margin: MARGIN,
    rowHeight: 150,
    containerRef,
    maxPerRow: 3,
  });

  return (
    <div className="flex flex-wrap" ref={containerRef}>
      {layout.map((tile) => (
        <MediaPreview
          key={tile.data.file.id}
          media={tile.data}
          style={{
            width: tile.scaledWidth,
            height: tile.scaledHeight,
            margin: MARGIN,
          }}
        />
      ))}
    </div>
  );
});
