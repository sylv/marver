import { useMemo, type FC } from "react";
import { Card } from "../../ui/card";
import type { FragmentOf } from "gql.tada";
import { graphql, unmask } from "../../../graphql";

const BBOX_SIZE = 0.001;

export const FileLocationFragment = graphql(`
  fragment FileLocation on File {
    exifData {
      longitude
      latitude
    }
  }
`);

// todo: we could use "pigeon-maps" instead of an iframe for some more styling options,
// but the iframe works remarkably well and doesn't bloat the bundle soo...
export const FileLocation: FC<{ file: FragmentOf<typeof FileLocationFragment> }> = ({ file: fileFrag }) => {
  const file = unmask(FileLocationFragment, fileFrag);
  const iframeUrl = useMemo(() => {
    if (!file.exifData?.longitude || !file.exifData?.latitude) return null;
    const base = new URL("https://www.openstreetmap.org/export/embed.html");
    const { longitude, latitude } = file.exifData;
    base.searchParams.append("layer", "mapnik");
    base.searchParams.append("marker", `${latitude},${longitude}`);
    base.searchParams.append(
      "bbox",
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
};
