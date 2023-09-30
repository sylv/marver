use image_hasher::ImageHash;
use napi::bindgen_prelude::Buffer;
use napi_derive::napi;

#[derive(Debug, Clone)]
pub struct Frame {
    pub image: Vec<u8>,
    pub from_ms: u32,
    pub to_ms: u32,
    pub hash: Option<ImageHash>,
    pub path: Option<String>,
    pub size: u32,
    pub was_merged: bool,
}

#[napi(object)]
pub struct MergedFrame {
    pub hash: Option<Buffer>,
    pub path: Option<String>,
    pub from_ms: u32,
    pub to_ms: u32,
    pub was_merged: bool,
    pub size: u32,
}

#[napi(object)]
pub struct VideoHashOptions {
    pub hash_size: Option<u32>,
    /// Whether to merge frames that are similar enough to the previous frame.
    pub merge_frames: bool,
    /// The match percent threshold required to merge two frames.
    /// This is an optimization technique, if two frames are similar enough
    /// they can be merged into one "for free".
    pub percent_merge_threshold: Option<f64>,
    /// If set, will write out the frames to disk at the given interval.
    pub write_frames: Option<WriteFrameOptions>,
    /// If set, will hash the frames at the given interval.
    pub hash_frames: Option<HashFrameOptions>,
}

#[napi(object)]
pub struct ImageHashOptions {
    pub hash_size: Option<u32>,
}

#[napi(object)]
pub struct WriteFrameOptions {
    pub output_dir: String,
    pub interval_ms: u32,
    pub depth_secs: Option<u32>,
}

#[napi(object)]
pub struct HashFrameOptions {
    /// How often to extract a frame, in milliseconds.
    pub interval_ms: u32,
    /// How far into the video to hash before stopping, in seconds
    pub depth_secs: Option<u32>,
}
