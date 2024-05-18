import { array, number, object, string } from "zod";
import { ffprobe } from "./ffprobe";

const FormatSchema = object({
  name: string(),
  nb_components: number().optional(),
  log2_chroma_w: number().optional(),
  log2_chroma_h: number().optional(),
  bits_per_pixel: number().optional(),
  flags: object({
    big_endian: number(),
    palette: number(),
    bitstream: number(),
    hwaccel: number(),
    planar: number(),
    rgb: number(),
    alpha: number(),
  }),
  components: array(
    object({
      index: number(),
      bit_depth: number(),
    }),
  ).optional(),
});

const OutputSchema = object({
  pixel_formats: array(FormatSchema),
});

export const getPixelFormats = async () => {
  const result = await ffprobe(["-show_pixel_formats"], { schema: OutputSchema });
  return result.pixel_formats.map((format) => [format.name, format] as const);
};
