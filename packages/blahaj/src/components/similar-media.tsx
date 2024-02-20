import { memo, useRef } from 'react';
import { useMediaListRows } from '../helpers/getRows';
import { MediaPreview } from './media-preview';
import type { FilePartsFragment } from '../@generated/graphql';

const MARGIN = 4;

interface SimilarMediaProps {
  similarFiles: FilePartsFragment[];
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
          key={tile.data.id}
          file={tile.data}
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
