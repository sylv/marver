import { loadConfig } from '@ryanke/venera';
import bytes from 'bytes';
import { resolve } from 'path';
import z from 'zod';

const BITS_REGEX = /(?<value>[0-9\.]+) ?(?<unit>mbps|kbps)/i;
const parseBits = (input: string) => {
  const match = input.match(BITS_REGEX);
  if (!match) {
    throw new Error(`Invalid bitrate: ${input}`);
  }

  const { value, unit } = match.groups!;
  const multiplier = unit.toLowerCase() === 'mbps' ? 1000000 : 1000;
  return Number(value) * multiplier;
};

const schema = z.object({
  metadata_dir: z.string().transform((dir) => resolve(dir)),
  source_dirs: z.array(z.string()).transform((dirs) => dirs.map((dir) => resolve(dir))),
  max_hashable_size: z.string().default('100MB').transform(bytes),
  secret: z.string().transform((secret) => new TextEncoder().encode(secret)),
  virtual_tags: z
    .array(
      z.object({
        match: z.string(),
        require_tags: z.array(z.string()).optional(),
        exclude_tags: z.array(z.string()).optional(),
        add_tags: z.array(z.string()).optional(),
      })
    )
    .default([]),
  transcode: z.object({
    video_profiles: z.array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        height: z.number().optional(),
        width: z.number().optional(),
        bitrate: z.string().transform(parseBits).optional(),
        segment_duration: z.number().default(4),
      })
    ),
  }),
});

const data = loadConfig('marver');
const config = schema.parse(data);

export { config };

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('should parse bits', () => {
    expect(parseBits('1mbps')).toBe(1000000);
    expect(parseBits('1.1mbps')).toBe(1100000);
  });
}
