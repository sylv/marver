use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::cmp::{max, min};
use std::fs::File;
use std::io::{Read, Write};
use std::iter::Iterator;
use std::process::{Command, Stdio};
use structs::{Frame, ImageHashOptions, MergedFrame, VideoHashOptions};

mod structs;

const JPEG_MAGIC_NUMBER: [u8; 3] = [0xFF, 0xD8, 0xFF];
const DEFAULT_HASH_SIZE: u32 = 32;
const DEFAULT_MERGE_THRESHOLD: f64 = 0.05; // 5%

/// Perceptually hashes an image, and returns the hash as a buffer.
/// Based on https://www.hackerfactor.com/blog/?/archives/432-Looks-Like-It.html
#[napi]
pub async fn phash_image(input_path: String, options: ImageHashOptions) -> Result<Buffer> {
    let hash_size = options.hash_size.unwrap_or(DEFAULT_HASH_SIZE);
    let hasher = image_hasher::HasherConfig::new()
        .hash_size(hash_size, hash_size)
        .to_hasher();

    let image = image::open(input_path).map_err(|e| napi::Error::from_reason(e.to_string()))?;
    let p_hash = hasher.hash_image(&image);
    let p_hash = p_hash.as_bytes();
    Ok(p_hash.into())
}

#[napi]
pub async fn phash_video(input_path: String, options: VideoHashOptions) -> Vec<MergedFrame> {
    extract_jpeg_frames(input_path.as_str(), options)
        .into_iter()
        .map(|frame| {
            let hash = frame.hash.map(|h| h.as_bytes().into());
            MergedFrame {
                hash,
                size: frame.size,
                path: frame.path,
                from_ms: frame.from_ms,
                to_ms: frame.to_ms,
                was_merged: frame.was_merged,
            }
        })
        .collect()
}

#[napi]
pub fn compare_hashes(buff1: Buffer, buff2: Buffer) -> u32 {
    let mut diff = 0;
    for (i, j) in buff1.iter().zip(buff2.iter()) {
        if i != j {
            diff += 1;
        }
    }

    diff
}

/// Determine how far into the video to check based on the videos length.
#[napi]
pub fn get_recommended_depth_secs(video_length_ms: u32) -> u32 {
    let max_depth_ms = 600 * 1000;
    let min_depth_ms = min(15 * 1000, max(video_length_ms, 1000));
    let modifier = if video_length_ms > 300 { 5 } else { 10 };
    let depth_ms = (video_length_ms / modifier).clamp(min_depth_ms, max_depth_ms);
    depth_ms / 1000
}

// todo: this is garbage and super inefficient, ideally should use streaming
// and iterate the frames as they become available. but im in a rush.
fn extract_jpeg_frames(input_path: &str, hash_opts: VideoHashOptions) -> Vec<Frame> {
    // if hash_opts.write_frames.depth_secs or hash_opts.hash_frames.depth_secs is set, pass the
    // longest to ffmpeg. otherwise, just process the whole video.
    let write_depth_secs = hash_opts
        .write_frames
        .as_ref()
        .and_then(|opts| opts.depth_secs)
        .unwrap_or(0);
    let hash_depth_secs = hash_opts
        .hash_frames
        .as_ref()
        .and_then(|opts| opts.depth_secs)
        .unwrap_or(0);

    let depth_secs = max(write_depth_secs, hash_depth_secs);
    let interval_ms = min(
        hash_opts
            .write_frames
            .as_ref()
            .map(|opts| opts.interval_ms)
            .unwrap_or(0),
        hash_opts
            .hash_frames
            .as_ref()
            .map(|opts| opts.interval_ms)
            .unwrap_or(0),
    );

    if interval_ms == 0 {
        panic!("interval_ms must be greater than 0")
    }

    let frames_per_second = 1000 / interval_ms;
    let frames_per_second_str = frames_per_second.to_string();

    let mut ffmepg_args = vec![
        "-i",
        input_path,
        "-r",
        &frames_per_second_str,
        "-f",
        "image2pipe",
        "-c:v",
        "mjpeg",
        "-",
    ];

    let depth_secs_str = depth_secs.to_string();
    if depth_secs != 0 {
        ffmepg_args.push("-t");
        ffmepg_args.push(&depth_secs_str);
    }

    let mut ffmpeg_process = Command::new("ffmpeg")
        .args(ffmepg_args)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
        .spawn()
        .expect("Failed to spawn ffmpeg process");

    let write_opts = hash_opts.write_frames;
    if let Some(write_opts) = &write_opts {
        assert_eq!(
            write_opts.interval_ms % interval_ms,
            0,
            "write interval_ms must be a multiple of frame interval_ms"
        );
    }

    let mut stdout = ffmpeg_process.stdout.take().expect("Failed to get stdout");
    let mut buffer = vec![0; 512];
    let mut jpeg_buffer = Vec::new();
    let mut seen_magic_bytes = false;
    let mut frames: Vec<Frame> = Vec::new();

    let hash_size = hash_opts.hash_size.unwrap_or(DEFAULT_HASH_SIZE);
    let mut frame_count: u32 = 0;
    while let Ok(n) = stdout.read_to_end(&mut buffer) {
        if n == 0 {
            break;
        }

        let mut i = 0;
        while i < n {
            if buffer[i..].starts_with(&JPEG_MAGIC_NUMBER) && !jpeg_buffer.is_empty() {
                if seen_magic_bytes {
                    let from_ms = frame_count * interval_ms;
                    let to_ms = from_ms + interval_ms;
                    frame_count += 1;

                    let path = if let Some(write_opts) = &write_opts {
                        let should_take_frame = from_ms % write_opts.interval_ms == 0;
                        let is_before_cutoff = if let Some(write_depth_secs) = write_opts.depth_secs
                        {
                            from_ms <= write_depth_secs * 1000
                        } else {
                            true
                        };

                        if should_take_frame && is_before_cutoff {
                            let path = format!("{}/{}.jpg", write_opts.output_dir, from_ms);
                            let mut file = File::create(&path).unwrap();
                            file.write_all(&jpeg_buffer).unwrap();
                            Some(path)
                        } else {
                            None
                        }
                    } else {
                        None
                    };

                    let hash = {
                        let image = image::load_from_memory(&jpeg_buffer).unwrap();
                        let hasher = image_hasher::HasherConfig::new()
                            .hash_size(hash_size, hash_size)
                            .to_hasher();

                        Some(hasher.hash_image(&image))
                    };

                    // path.is_none() because otherwise we wouldn't include the path in the output
                    if hash_opts.merge_frames && path.is_none() {
                        // if this frame is similar to the last frame, we skip
                        // it and add the duration to the last frame.
                        let previous_frame = frames.last_mut();
                        if let Some(previous_frame) = previous_frame {
                            let dist = previous_frame
                                .hash
                                .as_ref()
                                .expect("last frame missing hash")
                                .dist(hash.as_ref().expect("current frame missing hash"));

                            let merge_threshold = hash_opts
                                .percent_merge_threshold
                                .unwrap_or(DEFAULT_MERGE_THRESHOLD);
                            let percent_dist = dist as f64 / (hash_size * hash_size) as f64;
                            if percent_dist < merge_threshold {
                                previous_frame.to_ms = to_ms;
                                previous_frame.was_merged = true;
                                jpeg_buffer.clear();
                                jpeg_buffer.push(buffer[i]);
                                i += 1;
                                continue;
                            }
                        }
                    };

                    let frame = Frame {
                        size: jpeg_buffer.len() as u32,
                        image: std::mem::take(&mut jpeg_buffer),
                        path,
                        hash,
                        from_ms,
                        to_ms,
                        was_merged: false,
                    };

                    frames.push(frame);
                } else {
                    // ffmpeg seems to output a few garbage bytes before the first image,
                    // so we have to make sure we discard those or the first image is corrupted
                    seen_magic_bytes = true;
                    jpeg_buffer.clear();
                }
            }

            jpeg_buffer.push(buffer[i]);
            i += 1;
        }
    }

    frames
}
