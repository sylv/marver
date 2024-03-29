/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

/**
 * Perceptually hashes an image, and returns the hash as a buffer.
 * Based on https://www.hackerfactor.com/blog/?/archives/432-Looks-Like-It.html
 */
export function phashImage(inputPath: string, options: ImageHashOptions): Promise<Buffer>;
export function phashVideo(
  inputPath: string,
  options: VideoHashOptions,
): Promise<Array<MergedFrame>>;
export function compareHashes(buff1: Buffer, buff2: Buffer): number;
/** Determine how far into the video to check based on the videos length. */
export function getRecommendedDepthSecs(videoLengthMs: number): number;
export interface MergedFrame {
  hash?: Buffer;
  path?: string;
  fromMs: number;
  toMs: number;
  wasMerged: boolean;
  size: number;
}
export interface VideoHashOptions {
  hashSize?: number;
  /** Whether to merge frames that are similar enough to the previous frame. */
  mergeFrames: boolean;
  /**
   * The match percent threshold required to merge two frames.
   * This is an optimization technique, if two frames are similar enough
   * they can be merged into one "for free".
   */
  percentMergeThreshold?: number;
  /** If set, will write out the frames to disk at the given interval. */
  writeFrames?: WriteFrameOptions;
  /** If set, will hash the frames at the given interval. */
  hashFrames?: HashFrameOptions;
}
export interface ImageHashOptions {
  hashSize?: number;
}
export interface WriteFrameOptions {
  outputDir: string;
  intervalMs: number;
  depthSecs?: number;
}
export interface HashFrameOptions {
  /** How often to extract a frame, in milliseconds. */
  intervalMs: number;
  /** How far into the video to hash before stopping, in seconds */
  depthSecs?: number;
}
