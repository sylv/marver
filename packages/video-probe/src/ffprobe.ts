import { execa } from "execa";
import { number, object, string, z } from "zod";
import { FF_ERROR_MAP, FFError } from "./errors/FFError";

export interface ProbeFileOptions<T extends z.ZodTypeAny = z.ZodTypeAny> {
  schema?: T;
  ffprobePath?: string;
  countFrames?: boolean;
}

const errorSchema = object({
  error: object({
    code: number(),
    string: string(),
  }),
});

export const ffprobe = async <T extends z.ZodTypeAny>(
  args: string[],
  options?: ProbeFileOptions<T>,
): Promise<z.infer<T>> => {
  const ffprobePath = options?.ffprobePath || "ffprobe";
  try {
    const inputArgs = ["-v", "quiet", "-print_format", "json", "-show_error", ...args];
    const result = await execa(ffprobePath, inputArgs);
    const parsed = JSON.parse(result.stdout);
    if (options?.schema) {
      return options.schema.parse(parsed);
    }

    return parsed;
  } catch (error: any) {
    if (error.exitCode === 1) {
      let json: unknown;
      try {
        json = JSON.parse(error.stdout || error.stderr);
      } catch (error) {}

      if (json) {
        const parsedError = errorSchema.safeParse(json);
        if (parsedError.success) {
          const errorCode = FF_ERROR_MAP.get(parsedError.data.error.code);
          if (errorCode !== undefined) {
            throw new FFError(errorCode, parsedError.data.error.string);
          }

          // the other errors are all errors we should never trigger (like bad options), so
          // all if we've gotten to this point something is probably very wrong (or ffprobe was updated, i guess)
          throw new Error(
            `FFProbe error occured, but could not parse code "${parsedError.data.error.code}" into a known error code.`,
          );
        }

        // sometimes ffprobe exits with a non-zero code, but still outputs what we want.
        // only seen with ffprobe -show_error show_pixel_formats
        // -show_error seems to be causing it which makes no sense but ok.
        if (options?.schema) {
          // we could use safeParse, but by this point it should either be a valid error, or a valid output.
          // anything else and something is very wrong.
          return options.schema.parse(json);
        }
      }
    }

    throw error;
  }
};
