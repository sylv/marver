export enum VideoCodec {
  HEVC = "HEVC",
  H264 = "H264",
  VP9 = "VP9",
  VP8 = "VP8",
  AV1 = "AV1",
  VC1 = "VC1",
  MPEG2 = "MPEG2",
  MPEG4 = "MPEG4",
}

export enum AudioCodec {
  AAC = "AAC",
  AC3 = "AC3",
  Opus = "Opus",
  Vorbis = "Vorbis",
  MP3 = "MP3",
  EAC3 = "EAC3",
  FLAC = "FLAC",
  TrueHD = "TrueHD",
  DTS = "DTS",
}

const VIDEO_CODEC_NAMES = new Map<string, VideoCodec>([
  ["hevc", VideoCodec.HEVC],
  ["h.265", VideoCodec.HEVC],
  ["h265", VideoCodec.HEVC],
  ["h264", VideoCodec.H264],
  ["h.264", VideoCodec.H264],
  ["vp9", VideoCodec.VP9],
  ["vp8", VideoCodec.VP8],
  ["av1", VideoCodec.AV1],
  ["vc1", VideoCodec.VC1],
  ["mpeg2", VideoCodec.MPEG2],
  ["mpeg4", VideoCodec.MPEG4],
]);

const AUDIO_CODEC_NAMES = new Map<string, AudioCodec>([
  ["aac", AudioCodec.AAC],
  ["opus", AudioCodec.Opus],
  ["vorbis", AudioCodec.Vorbis],
  ["mp3", AudioCodec.MP3],
  ["flac", AudioCodec.FLAC],
  ["ac3", AudioCodec.AC3],
  ["eac3", AudioCodec.EAC3],
  ["e-ac-3", AudioCodec.EAC3],
  ["eac-3", AudioCodec.EAC3],
  ["e-ac3", AudioCodec.EAC3],
  ["truehd", AudioCodec.TrueHD],
  ["dts", AudioCodec.DTS],
]);

export function parseVideoCodec(input: string): VideoCodec | null {
  input = input.toLowerCase();

  const aliased = VIDEO_CODEC_NAMES.get(input);
  if (aliased) return aliased;

  const candidates: VideoCodec[] = [];
  for (const [key, value] of VIDEO_CODEC_NAMES.entries()) {
    if (input === key) return value;
    if (input.includes(key) && !candidates.includes(value)) candidates.push(value);
  }

  if (candidates.length === 1) return candidates[0];
  return null;
}

export function parseAudioCodec(input: string): AudioCodec | null {
  input = input.toLowerCase();

  const aliased = AUDIO_CODEC_NAMES.get(input);
  if (aliased) return aliased;

  const candidates: AudioCodec[] = [];
  for (const [key, value] of AUDIO_CODEC_NAMES.entries()) {
    if (input === key) return value;
    if (input.includes(key) && !candidates.includes(value)) candidates.push(value);
  }

  if (candidates.length === 1) return candidates[0];
  return null;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("parses video codecs", () => {
    expect(parseVideoCodec("hevc")).toEqual(VideoCodec.HEVC);
    expect(parseVideoCodec("h264")).toEqual(VideoCodec.H264);
    expect(parseVideoCodec("H.264")).toEqual(VideoCodec.H264);
    expect(parseVideoCodec("H.265 / HEVC")).toEqual(VideoCodec.HEVC);
    expect(parseVideoCodec("AVC/h.264")).toEqual(VideoCodec.H264);
  });

  it("parses audio codecs", () => {
    expect(parseAudioCodec("aac")).toEqual(AudioCodec.AAC);
    expect(parseAudioCodec("AC3")).toEqual(AudioCodec.AC3);
    expect(parseAudioCodec("AC3")).toEqual(AudioCodec.AC3);
  });
}
