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
    // skip any frames that aren't keyframes
    // we could omit this and have more accurate timestamps, but it is significantly slower (7.8s vs 19.2s)
    // todo: this should be an option and we automatically disable it on videos with keyframes too far apart
    "-skip_frame",
    "nokey",
    "-i",
    videoPath,
    "-vf",
    // wait options.intervalSecs between keyframes
    // always select the first keyframe
    // showinfo is needed to get the pts_time for accurate timestamps
    // todo: sometimes the keyframe isnt the first frame. we should handle that somehow
    `select='eq(n\,0)+gte(t-prev_selected_t\,${options.intervalSecs})',showinfo`,
    // vfr is needed to get accurate timestamps
    "-vsync",
    "vfr",
    "-f",
    "image2pipe",
    "-vcodec",
    "mjpeg",
    "pipe:1",
  ];

  const ffmpeg = spawn("ffmpeg", args, {
    stdio: ["ignore", "pipe", "pipe"],
  });

  let leftover = Buffer.alloc(0);
  let lastPtsTime = 0;

  ffmpeg.stderr.on("data", (data) => {
    const str = data.toString();
    const match = str.match(/pts_time:([0-9.]+)/);
    if (match) {
      const ptsTime = +match[1];
      if (ptsTime < lastPtsTime) {
        console.log(data.toString());
        console.warn("pts_time went backwards");
      }

      lastPtsTime = Math.round(ptsTime);
    }
  });

  for await (const chunk of ffmpeg.stdout) {
    let data = Buffer.concat([leftover, chunk]);
    let frameStart = data.indexOf(JPEG_HEADER);

    while (frameStart !== -1) {
      const nextFrameStart = data.indexOf(JPEG_HEADER, frameStart + JPEG_HEADER.length);
      if (nextFrameStart === -1) break;

      const frameData = data.subarray(frameStart, nextFrameStart);
      yield {
        positionSecs: lastPtsTime,
        data: frameData,
      };

      if (options.maxDepthSecs && lastPtsTime >= options.maxDepthSecs) {
        ffmpeg.kill();
        return;
      }

      data = data.subarray(nextFrameStart);
      frameStart = data.indexOf(JPEG_HEADER);
    }

    leftover = data;
  }
}
