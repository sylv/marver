export enum Resolution {
  SD_480 = "SD_480",
  SD_576 = "SD_576",
  HD_720 = "HD_720",
  HD_1080 = "HD_1080",
  UHD_4K = "UHD_4K",
  UHD_8K = "UHD_8K",
}

const RESOLUTION_BOUNDS = [
  [Resolution.SD_480, [0, 480]],
  [Resolution.SD_576, [480, 576]],
  [Resolution.HD_720, [576, 720]],
  [Resolution.HD_1080, [720, 1080]],
  [Resolution.UHD_4K, [1080, 2160]],
  [Resolution.UHD_8K, [2160, Infinity]],
] as const;

const RESOLUTION_NAMES = new Map<string, Resolution>([
  ["480p", Resolution.SD_480],
  ["576p", Resolution.SD_576],
  ["720p", Resolution.HD_720],
  ["1080p", Resolution.HD_1080],
  ["2160p", Resolution.UHD_4K],
  ["4320p", Resolution.UHD_8K],
  ["4k", Resolution.UHD_4K],
  ["8k", Resolution.UHD_8K],
  ["sd", Resolution.SD_480],
  ["hd", Resolution.HD_720],
  ["fhd", Resolution.HD_1080],
  ["uhd", Resolution.UHD_4K],
]);

// 1080, 1920x1080, 1920*1080
const BOUNDS_REGEX = /^(?<one>[0-9]{3,4})( ?(?:x|\*) ?(?<two>[0-9]{3,4}))?$/;

export const findResolution = ({
  width,
  height,
}: {
  width?: number | null;
  height?: number | null;
}): Resolution | null => {
  if (!width && !height) return null;

  const smallestDimension = Math.min(width || Infinity, height || Infinity);
  const match = RESOLUTION_BOUNDS.find((it) => smallestDimension >= it[1][0] && smallestDimension <= it[1][1]);
  if (match) return match[0];
  return null;
};

export const parseResolution = (input: string): Resolution | null => {
  input = input.toLowerCase();

  const boundsMatch = input.match(BOUNDS_REGEX);
  if (boundsMatch) {
    // if height is missing, assume the first number is the height
    const width = boundsMatch.groups?.two || boundsMatch.groups!.one!;
    const height = boundsMatch.groups?.two ? boundsMatch.groups?.one : null;
    return findResolution({ width: +width, height: height ? +height : null });
  }

  const candidates: Resolution[] = [];
  for (const [key, value] of RESOLUTION_NAMES.entries()) {
    if (input === key) return value;
    if (input.includes(key) && !candidates.includes(value)) candidates.push(value);
  }

  if (candidates.length === 1) return candidates[0];
  return null;
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("should parse resolution", () => {
    expect(parseResolution("480p")).to.equal(Resolution.SD_480);
    expect(parseResolution("1080p")).to.equal(Resolution.HD_1080);
    expect(parseResolution("1080")).to.equal(Resolution.HD_1080);
    expect(parseResolution("1920x1080")).to.equal(Resolution.HD_1080);
    expect(parseResolution("1920*1080")).to.equal(Resolution.HD_1080);
    expect(parseResolution("720*1280")).to.equal(Resolution.HD_720);
  });
}
