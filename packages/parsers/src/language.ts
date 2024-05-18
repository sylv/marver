import { getLanguages } from "./macros/get-languages" assert { type: "macro" };

const LANGUAGES = getLanguages();
const LANGUAGE_MAP = new Map([...LANGUAGES.map, ...LANGUAGES.names]);
const LANGUAGE_NAMES = LANGUAGES.names;

const BCP_47_REGEX = /^([a-z]{2,3})(?:_|-)[a-z]{2,3}$/i;
const TAG_REGEX = / (\[|\().*?(\]|\))$/g;

export enum LanguageType {
  Forced = "Forced",
  Commentary = "Commentary",
  Dubbed = "Dubbed",
  HearingImpaired = "HearingImpaired",
}

const TYPES = [
  [/forced/i, LanguageType.Forced],
  [/commentary/i, LanguageType.Commentary],
  [/dubbed|\bdub\b/i, LanguageType.Dubbed],
  [/hearing.impaired|\bsdh\b/i, LanguageType.HearingImpaired],
] as const;

const getType = (input: string): LanguageType | null => {
  for (const [pattern, value] of TYPES) if (pattern.test(input)) return value;
  return null;
};

/**
 * Parse a language name, code, or BCP-47 string into an ISO 639-1 language code.
 * @example
 * parseLanguage("en") // "en"
 * parseLanguage("eng") // "en"
 * parseLanguage("english") // "en"
 * parseLanguage("English") // "en"
 * parseLanguage("English (US)") // "en"
 * parseLanguage("English (Forced)") // "en_forced"
 */
export const parseLanguage = (input: string): { language: string | null; type: LanguageType | null } => {
  input = input.toLowerCase().trim();
  const type = getType(input);

  input = input.replace(TAG_REGEX, "").trim();
  const language = LANGUAGE_MAP.get(input);
  if (language) return { language, type };

  input = input.replace(BCP_47_REGEX, "$1");
  const stripped = LANGUAGE_MAP.get(input);
  if (stripped) return { language: stripped, type };

  for (const language of LANGUAGE_NAMES) {
    const includesName = input.includes(language[0].toLowerCase());
    if (includesName) {
      return { language: language[1], type };
    }
  }

  return { language: null, type };
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("should parse language codes", () => {
    expect(parseLanguage("en")).toEqual({ language: "en", type: null });
    expect(parseLanguage("eng")).toEqual({ language: "en", type: null });
    expect(parseLanguage("english")).toEqual({ language: "en", type: null });
    expect(parseLanguage("English")).toEqual({ language: "en", type: null });
    expect(parseLanguage("English (US)")).toEqual({ language: "en", type: null });
    expect(parseLanguage("English (Forced)")).toEqual({ language: "en", type: LanguageType.Forced });
    expect(parseLanguage("ENGLISH")).toEqual({ language: "en", type: null });
    expect(parseLanguage("en-US")).toEqual({ language: "en", type: null });
    expect(parseLanguage("en-us")).toEqual({ language: "en", type: null });
    expect(parseLanguage("en (forced)")).toEqual({ language: "en", type: LanguageType.Forced });
  });

  it("should parse types", () => {
    expect(getType("English")).toBe(null);
    expect(getType("English (US)")).toBe(null);
    expect(getType("English (Forced)")).toBe(LanguageType.Forced);
    expect(getType("English (Commentary)")).toBe(LanguageType.Commentary);
    expect(getType("English (Dubbed)")).toBe(LanguageType.Dubbed);
    expect(getType("English (DUB)")).toBe(LanguageType.Dubbed);
    expect(getType("en_dubbed")).toBe(LanguageType.Dubbed);
    expect(getType("English [SDH]")).toBe(LanguageType.HearingImpaired);
  });
}
