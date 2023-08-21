const DATE_SEPARATORS = ['/', '.', '-', '_'];
const HINT_LIMIT = 7;

/**
 * Parses a date string into a Date object. Can be in ISO 8601, US, or most other formats.
 * If difference between dates is more than 7 days, returns false score.
 * @param hint can be provided to determine format if its unclear.
 */
export const parseDate = (date: string, hint?: Date): { date: Date; confident: boolean } | null => {
  // Check if date string matches ISO 8601 format "YYYY-MM-DD"
  const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    // Return the date in UTC time and confident score of true
    return {
      date: new Date(Date.UTC(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3])),
      confident: true,
    };
  }

  // Check for the presence of any separators in the date string
  let separator = '';
  for (const sep of DATE_SEPARATORS) {
    if (date.includes(sep)) {
      separator = sep;
      break;
    }
  }
  if (!separator) {
    // Return null if there's no separator in the date string
    return null;
  }

  // Split the date string into parts based on the separator
  const parts = date.split(separator);
  if (parts.length !== 3) {
    // Return null if the date string can't be split into 3 parts
    return null;
  }

  // Destructure the parts into variables
  const [first, second, third] = parts.map((part) => +part);
  // Check if the date string is in the format "DD/MM/YYYY" or "DD.MM.YYYY" or "DD-MM-YYYY" or "DD_MM_YYYY"
  if (first > 12 && first <= 31 && second > 12 && second <= 31) {
    return { date: new Date(Date.UTC(third, first - 1, second)), confident: false };
  }

  // Check if the date string is in the format "MM/DD/YYYY"
  if (first <= 12 && first > 0 && second > 12 && second <= 31) {
    return { date: new Date(Date.UTC(third, second - 1, first)), confident: true };
  }

  // Check if the date string is in the format "DD/MM/YYYY"
  if (first > 12 && first <= 31 && second <= 12 && second > 0) {
    return { date: new Date(Date.UTC(third, first - 1, second)), confident: true };
  }

  if (!hint) {
    // Return null if there's no hint provided to determine the date format
    return null;
  }

  // Calculate the difference between the candidate timestamp and the hint timestamp
  const hintTimestamp = hint.valueOf();
  let candidateTimestamp = new Date(Date.UTC(third, second - 1, first)).valueOf();
  if (Math.abs(candidateTimestamp - hintTimestamp) > HINT_LIMIT * 24 * 60 * 60 * 1000) {
    candidateTimestamp = new Date(Date.UTC(third, first - 1, second)).valueOf();
  }

  // Return the date and confident score based on the difference between the timestamps
  return Math.abs(candidateTimestamp - hintTimestamp) < HINT_LIMIT * 24 * 60 * 60 * 1000
    ? { date: new Date(candidateTimestamp), confident: true }
    : null;
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('parses ISO 8601 dates', () => {
    const date = parseDate('2022-08-08')!;
    expect(date.date).toEqual(new Date('2022-08-08'));
    expect(date.confident).toBe(true);
  });

  it('parses US dates', () => {
    const date = parseDate('08/08/22')!;
    expect(date.date).toEqual(new Date('2022-08-08'));
    expect(date.confident).toBe(true);
  });

  it('parses other dates', () => {
    const date = parseDate('08.08.22')!;
    expect(date.date).toEqual(new Date('2022-08-08'));
    expect(date.confident).toBe(true);
  });

  it('returns confident score of false when date format is ambiguous', () => {
    const date = parseDate('08/08/2022')!;
    expect(date.confident).toBe(false);
  });

  it('uses hint date to determine the correct format', () => {
    const hint = new Date('2022-08-01');
    const date = parseDate('08/08/2022', hint)!;
    expect(date.date).toEqual(new Date('2022-08-08'));
    expect(date.confident).toBe(true);
  });

  it('returns null when date format is ambiguous and hint date is not provided', () => {
    expect(parseDate('08/08/2022')).toBe(null);
  });

  it('returns null when date format is ambiguous and hint date is too far away', () => {
    const hint = new Date('2022-08-01');
    expect(parseDate('08/08/2022', hint)).toBe(null);
  });

  it('returns null when the date is malformed', () => {
    expect(parseDate('08/08/202')).toBe(null);
    expect(parseDate('not_a_date')).toBe(null);
  });
}
