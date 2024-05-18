const BITS_PATTERN = /^(?<value>[0-9\.]+)(?<suffix>Mbps|Kbps)$/i;

/** Parse bits from a string */
export function parseBits(input: string | number) {
  if (typeof input === "number") return input;
  const match = BITS_PATTERN.exec(input);
  if (!match) return null;
  const value = parseFloat(match.groups!.value);
  const suffix = match.groups!.suffix.toLowerCase();
  switch (suffix) {
    case "mbps":
      return value * 1000000;
    case "kbps":
      return value * 1000;
    default:
      return null;
  }
}

const BYTES_PATTERN = /^(?<value>[0-9\.]+)(?<suffix>MB|KB|GB)$/i;

/** Parse bytes from a string */
export function parseBytes(input: string | number) {
  if (typeof input === "number") return input;
  const match = BYTES_PATTERN.exec(input);
  if (!match) return null;
  const value = parseFloat(match.groups!.value);
  const suffix = match.groups!.suffix.toLowerCase();
  switch (suffix) {
    case "mb":
      return value * 1000000;
    case "kb":
      return value * 1000;
    case "gb":
      return value * 1000000000;
    default:
      return null;
  }
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("parses bits", () => {
    expect(parseBits("1Mbps")).toBe(1000000);
    expect(parseBits("1.5Mbps")).toBe(1500000);
    expect(parseBits("1.5mbps")).toBe(1500000);
    expect(parseBits("1.5Kbps")).toBe(1500);
    expect(parseBits("1.5kbps")).toBe(1500);
  });

  it("parses bytes", () => {
    expect(parseBytes("1MB")).toBe(1000000);
    expect(parseBytes("1.5MB")).toBe(1500000);
    expect(parseBytes("1.5mb")).toBe(1500000);
    expect(parseBytes("1.5KB")).toBe(1500);
    expect(parseBytes("1.5kb")).toBe(1500);
    expect(parseBytes("1.5GB")).toBe(1500000000);
    expect(parseBytes("1.5gb")).toBe(1500000000);
  });
}
