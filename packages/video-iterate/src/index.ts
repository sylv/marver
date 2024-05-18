import { execa } from "execa";

export interface IterateVideoOptions {
  intervalSecs: number;
  inputDurationSecs: number;
  maxDepthSecs?: number;
  /** webp is slower than jpeg (3.7s vs 2.8s) in my testing */
  frameFormat?: "jpeg" | "webp";
}

export interface Frame {
  positionSecs: number;
  data: Buffer;
}

// todo: allow a `maxFrames` option to limit the number of frames
// a 10 hour video probably doesn't need 36000 frames, so we can take the intervalSecs and
// increase it until its under the frame limit, its unlikely the skipped frames are important anyway.
// though keeping a fast interval towards the start of the video is a good idea.
export async function* iterateVideo(videoPath: string, options: IterateVideoOptions): AsyncGenerator<Frame> {
  const frameFormat = options.frameFormat ?? "webp";
  let currentPositionSecs = 0;
  while (currentPositionSecs < options.inputDurationSecs) {
    const args = [];

    args.push("-ss", currentPositionSecs.toString());
    args.push("-i", videoPath);
    args.push("-vframes", "1");

    switch (frameFormat) {
      case "jpeg":
        args.push("-vcodec", "mjpeg");
        break;
      case "webp":
        args.push("-vcodec", "libwebp");
        break;
    }

    args.push("-f", "image2pipe", "pipe:1");
    const { stdout } = await execa("ffmpeg", args, {
      encoding: "buffer",
    });

    // todo: if this frame is visually similar to the last, skip it (perceptual hash)
    yield {
      positionSecs: currentPositionSecs,
      data: stdout,
    };

    currentPositionSecs += options.intervalSecs;
    if (options.maxDepthSecs && currentPositionSecs >= options.maxDepthSecs) {
      break;
    }
  }
}
