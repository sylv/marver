import { LanguageType, parseLanguage } from "@ryanke/parsers/language";

export const getLanguageTypeFromDisposition = (disposition: any) => {
  if (disposition?.forced === 1) return LanguageType.Forced;
  if (disposition?.comment === 1) return LanguageType.Commentary;
  if (disposition?.hearing_impaired === 1) return LanguageType.HearingImpaired;
  if (disposition?.dub === 1) return LanguageType.Dubbed;
  return null;
};
export const getLanguage = (stream: any) => {
  const fromDisposition = getLanguageTypeFromDisposition(stream.disposition);

  // "und" appears to mean "undefined" or "unknown" so we ignore it.
  if (stream.tags?.language && stream.tags?.language !== "und") {
    const result = parseLanguage(stream.tags.language);
    if (result.language === null) {
      console.warn(`Failed to parse language: ${stream.tags?.language}`);
    }

    if (result.type === null) result.type = fromDisposition;
    return result;
  }

  return { language: null, type: fromDisposition };
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("should parse language", () => {
    expect(getLanguage({ tags: { language: "eng" } })).toEqual({ language: "en", type: null });
    expect(getLanguage({ tags: { language: "und" } })).toEqual({ language: null, type: null });
    expect(getLanguage({ tags: { language: "eng (forced)" } })).toEqual({
      language: "en",
      type: LanguageType.Forced,
    });
    expect(
      getLanguage({
        disposition: {
          default: 1,
          forced: 1,
        },
        tags: {
          language: "English",
        },
      }),
    ).toEqual({ language: "en", type: LanguageType.Forced });
  });
}
