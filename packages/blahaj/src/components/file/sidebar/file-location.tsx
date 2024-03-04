import { memo, useMemo } from 'react';
import type { FullFileFragment } from '../../../@generated/graphql';
import { Card } from '../../ui/card';

const BBOX_SIZE = 0.001;

// todo: we could use "pigeon-maps" instead of an iframe for some more styling options,
// but the iframe works remarkably well and doesn't bloat the bundle soo...
export const FileLocation = memo<{ file: FullFileFragment }>(({ file }) => {
  const iframeUrl = useMemo(() => {
    if (!file.exifData?.longitude || !file.exifData?.latitude) return null;
    const base = new URL('https://www.openstreetmap.org/export/embed.html');
    const { longitude, latitude } = file.exifData;
    base.searchParams.append('layer', 'mapnik');
    base.searchParams.append('marker', `${latitude},${longitude}`);
    base.searchParams.append(
      'bbox',
      `${longitude - BBOX_SIZE},${latitude - BBOX_SIZE},${longitude + BBOX_SIZE},${latitude + BBOX_SIZE}`,
    );

    return base.href;
  }, [file.exifData]);

  if (!iframeUrl) return null;

  return (
    <Card className="overflow-hidden">
      <iframe
        title="Map"
        className="w-full h-40"
        frameBorder="0"
        referrerPolicy="no-referrer"
        src={iframeUrl}
      />
    </Card>
  );
});
