const DURATION_REGEX = /^(?<hours>\d+):(?<minutes>\d+):(?<seconds>\d+(\.\d+)?)$/;
const NUMBER_REGEX = /^\d+(\.\d+)?$/;

export const parseDuration = (duration: string) => {
  if (duration === "N/A") return null;
  if (NUMBER_REGEX.test(duration)) {
    return Number.parseFloat(duration);
  }

  const match = duration.match(DURATION_REGEX);
  if (!match) return null;
  const hours = +match.groups!.hours * 3600;
  const minutes = +match.groups!.minutes * 60;
  const seconds = +match.groups!.seconds;

  return hours + minutes + seconds;
};

export const getDuration = (stream: any, json: any) => {
  if (stream.duration) return parseDuration(stream.duration);
  if (stream.tags?.DURATION) return parseDuration(stream.tags.DURATION);
  if (stream.tags?.["DURATION-eng"]) return parseDuration(stream.tags["DURATION-eng"]);
  return null;
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("should parse duration", () => {
    expect(parseDuration("N/A")).toBe(null);
    expect(parseDuration("1.234")).toBe(1.234);
    expect(parseDuration("01:23:45.678")).toBe(5025.678);
    expect(parseDuration("00:00:01.520000000")).toBe(1.52);
  });
}
