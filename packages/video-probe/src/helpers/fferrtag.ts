// https://ffmpeg.org/doxygen/0.6/common_8h-source.html#l00181
const MKTAG = (a: string | number, b: string, c: string, d: string): number => {
  return (
    (typeof a === "number" ? a : a.charCodeAt(0)) |
    (b.charCodeAt(0) << 8) |
    (c.charCodeAt(0) << 16) |
    (d.charCodeAt(0) << 24)
  );
};

// https://ffmpeg.org/doxygen/trunk/error_8h_source.html#l00049
export const FFERRTAG = (a: string | number, b: string, c: string, d: string): number => {
  return -MKTAG(a, b, c, d);
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("should convert to ffmpeg codes", () => {
    expect(FFERRTAG("I", "N", "D", "A")).toBe(-1094995529);
    expect(FFERRTAG(0xf8, "P", "R", "O")).toBe(-1330794744);
  });
}
