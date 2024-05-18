export const getBitrate = (stream: any) => {
  if (stream.bit_rate) return stream.bit_rate;
  if (stream.tags?.BPS) return stream.tags.BPS;
  if (stream.tags?.["BPS-eng"]) return stream.tags["BPS-eng"];
  return null;
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("should parse bitrate", () => {
    expect(getBitrate({ bit_rate: "1234" })).toBe("1234");
    expect(getBitrate({ tags: { BPS: "1234" } })).toBe("1234");
    expect(getBitrate({ tags: { "BPS-eng": "1234" } })).toBe("1234");
    expect(getBitrate({})).toBe(null);
  });
}
