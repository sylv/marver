import { getPixelFormats } from "../macros" assert { type: "macro" };

const pixelFormats = new Map(await getPixelFormats());

export const getBitDepth = (stream: any) => {
  if (stream.bits_per_raw_sample) return stream.bits_per_raw_sample;
  if (stream.pix_fmt) {
    const format = pixelFormats.get(stream.pix_fmt);
    if (format && format.components && format.components[0]) {
      return format.components[0].bit_depth;
    }
  }

  return null;
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("should parse bit depth", () => {
    expect(getBitDepth({ bits_per_raw_sample: 8 })).toBe(8);
    expect(getBitDepth({ pix_fmt: "yuv420p" })).toBe(8);
    expect(getBitDepth({})).toBe(null);
  });
}
