import ISO6391 from "iso-639-1";
import { iso6392 } from "iso-639-2";

/**
 * Compile a list of languages and their ISO codes.
 * @returns two arrays: "map" maps common codes to ISO codes. "names" maps lowercase names to ISO codes.
 * if you want to lookup a language, you should make a Map<string, string> from both arrays.
 * They are provided separately so if you want to filter more strictly by name, you can use just the names array.
 */
export const getLanguages = () => {
  let map: [string, string][] = [];
  let names: [string, string][] = [];

  const seenNames = new Set<string>();

  for (const language of ISO6391.getLanguages(ISO6391.getAllCodes())) {
    map.push([language.code, language.code]);
    if (language.name) {
      const lower = language.name.toLocaleLowerCase();
      names.push([lower, language.code]);
      seenNames.add(lower);
    }

    if (language.nativeName) {
      const lower = language.nativeName.toLocaleLowerCase();
      names.push([lower, language.code]);
      seenNames.add(lower);
    }
  }

  for (const language of iso6392) {
    if (!language.iso6391) continue;
    if (language.iso6392B) map.push([language.iso6392B.toLocaleLowerCase(), language.iso6391]);
    if (language.iso6391) map.push([language.iso6391, language.iso6391]);
    if (language.iso6392T) map.push([language.iso6392T.toLocaleLowerCase(), language.iso6391]);
    if (language.name && !seenNames.has(language.name.toLocaleLowerCase()))
      map.push([language.name.toLocaleLowerCase(), language.iso6391]);
  }

  map.push(["fil", "tl"]);
  map.push(["filipino", "tl"]);

  map = [...new Map(map)];
  names = [...new Map(names)];

  return { map, names };
};
