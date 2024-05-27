import { parse } from "chrono-node";

export type ParsedExifDate = { error: false; date: Date } | { error: true; message: string };

const PREPROCESSORS: { pattern: RegExp; replacer: (groups: Record<string, string>) => string }[] = [
  {
    // weird exif format of 2012:08:21
    pattern: /^(?<year>\d{4}):(?<maybe_month>\d{2}):(?<maybe_day>\d{2})\b/,
    replacer: ({ year, maybe_month, maybe_day }) => `${year}.${maybe_month}.${maybe_day}`,
  },
  {
    // parse standalone years as the first month
    pattern: /^(?<year>\d{4})$/,
    replacer: ({ year }) => `${year}.01.01`,
  },
];

const preprocess = (input: string) => {
  let result = input;
  for (const preprocessor of PREPROCESSORS) {
    const match = preprocessor.pattern.exec(result);
    if (match) {
      result = preprocessor.replacer(match.groups!);
    }
  }

  return result;
};

export const parseExifDate = (input: string): ParsedExifDate => {
  const processed = preprocess(input);
  const result = parse(processed);

  if (result[0]) {
    if ([...result[0].tags()].some((parser) => parser.toLowerCase().includes("casual"))) {
      // chrono supports relative dates like "tomorrow at 3pm", this makes sure we aren't using that.
      // todo: probably a better way to do this
      return { error: true, message: `Could not parse "${input}" as it is not specific enough` };
    }

    const value = result[0].start.date();
    if (value > new Date()) return { error: true, message: "Date is in the future" };
    return { error: false, date: value };
  }

  return { error: true, message: `Could not parse "${input}" as a valid date` };
};

export const parseExifDateOrThrow = (input: string): Date => {
  const result = parseExifDate(input);
  if (result.error) throw new Error(result.message);
  return result.date;
};

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest;
  it("should parse exif dates", () => {
    expect(parseExifDateOrThrow("2012:08:21")).toMatchInlineSnapshot(`2012-08-21T12:00:00.000Z`);
    expect(parseExifDateOrThrow("14.05.2024 05:27:27")).toMatchInlineSnapshot(`2024-05-14T05:27:27.000Z`);
    expect(parseExifDateOrThrow("14.05.2024")).toMatchInlineSnapshot(`2024-05-14T12:00:00.000Z`);
    expect(parseExifDateOrThrow("2024")).toMatchInlineSnapshot(`2024-01-01T12:00:00.000Z`);
  });
}

console.log(parseExifDateOrThrow("14.05.2024 05:27:27"));
