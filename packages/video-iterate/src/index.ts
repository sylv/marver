import { spawn } from "child_process";

export interface IterateVideoOptions {
  /** How often to take a frame from the video. */
  intervalSecs: number;
  /** The maximum depth to go into the video */
  maxDepthSecs?: number;
}

export interface Frame {
  positionSecs: number;
  data: Buffer;
}

// note: originally this supported webp and jpeg, but webp was considerably slower.
// the difference was around 32s for webp and 24s for jpeg over long videos,
// and it caused other compatibility issues. sticking to jpeg seems simpler.
const JPEG_HEADER = Buffer.from([0xff, 0xd8]);

/**
 * Iterate over frames from a video file.
 * @param videoPath Path to the video file.
 */
export async function* iterateVideo(videoPath: string, options: IterateVideoOptions): AsyncGenerator<Frame> {
  const args = [
    "-skip_frame",
    "nokey",
    "-i",
    videoPath,
    "-vf",
    `fps=1/${options.intervalSecs}`,
    "-vsync",
    "vfr",
    "-f",
    "image2pipe",
    "-vcodec",
    "mjpeg",
    "pipe:1",
  ];

  const ffmpeg = spawn("ffmpeg", args, {
    stdio: ["ignore", "pipe", "ignore"],
  });

  let currentPositionSecs = 0;
  let leftover = Buffer.alloc(0);

  for await (const chunk of ffmpeg.stdout) {
    let data = Buffer.concat([leftover, chunk]);
    let frameStart = data.indexOf(JPEG_HEADER);

    while (frameStart !== -1) {
      const nextFrameStart = data.indexOf(JPEG_HEADER, frameStart + JPEG_HEADER.length);
      if (nextFrameStart === -1) break;

      const frameData = data.subarray(frameStart, nextFrameStart);
      yield {
        positionSecs: currentPositionSecs,
        data: frameData,
      };

      currentPositionSecs += options.intervalSecs;
      if (options.maxDepthSecs && currentPositionSecs >= options.maxDepthSecs) {
        ffmpeg.kill();
        return;
      }

      data = data.subarray(nextFrameStart);
      frameStart = data.indexOf(JPEG_HEADER);
    }

    leftover = data;
  }
}
