import { loadConfig } from "@ryanke/venera";
import bytes from "bytes";
import { resolve } from "node:path";
import z, { array, boolean, number, object, string } from "zod";
import ms from "ms";
import { parseBits } from "@ryanke/parsers/bits";

const schema = object({
  metadata_dir: string().transform((dir) => resolve(dir)),
  source_dirs: array(string()).transform((dirs) => dirs.map((dir) => resolve(dir))),
  max_hashable_size: string().default("100MB").transform(bytes),
  secret: string().transform((secret) => new TextEncoder().encode(secret)),
  disable_tasks: boolean().default(false),
  orm_debug: boolean().default(false),
  use_quantized: boolean().default(true),
  startup_timeout: z
    .string()
    .default("30s")
    .transform((value) => ms(value)),
  is_development: boolean().default(process.env.NODE_ENV !== "production"),
  is_production: boolean().default(process.env.NODE_ENV === "production"),
  ocr: z
    .object({
      enabled: boolean().default(true),
      min_word_score: number().default(0.2),
    })
    .default({}),
  face_detection: z
    .object({
      enabled: boolean().default(true),
      // the score required to match a face to a person
      // score is lower because most instances will only have a dozen or so people,
      // so false positives are unlikely
      min_person_score: number().default(0.5),
      // the score required to match a face. this is based on the confidence score
      // returned by insightface. the score is higher to discard low quality matches,
      // which could dilute the results.
      min_face_score: number().default(0.7),
    })
    .default({}),
  virtual_tags: z
    .array(
      object({
        match: string(),
        require_tags: array(string()).optional(),
        exclude_tags: array(string()).optional(),
        add_tags: array(string()).optional(),
      }),
    )
    .default([]),
  transcode: object({
    video_profiles: array(
      object({
        name: string(),
        description: string().optional(),
        max_height: number().optional(),
        max_width: number().optional(),
        bitrate: string().transform(parseBits).optional(),
        segment_duration: number().default(4),
      }),
    ),
  }),
});

const data = loadConfig("marver");
const config = schema.parse(data);

export { config };

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("should parse bits", () => {
    expect(parseBits("1mbps")).toBe(1000000);
    expect(parseBits("1.1mbps")).toBe(1100000);
  });
}
