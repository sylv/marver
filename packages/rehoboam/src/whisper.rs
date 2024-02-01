use std::io::Cursor;

use whisper_rs::{FullParams, SamplingStrategy, WhisperContext};

use crate::util::{ensure_file, get_models_dir};

const MODEL_URL: &str =
    "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin?download=true";

pub struct Whisper {
    context: WhisperContext,
}

pub struct Subtitle {
    pub text: String,
    pub start: i64,
    pub end: i64,
}

impl Whisper {
    pub async fn init() -> anyhow::Result<Self> {
        let mut model_path = get_models_dir();
        model_path.push("whisper");
        model_path.push("base.bin");

        ensure_file(MODEL_URL, &model_path, None).await?;

        let context = WhisperContext::new(&model_path.to_string_lossy())?;

        Ok(Self { context })
    }

    pub fn predict(&self, audio: Vec<u8>) -> anyhow::Result<Vec<Subtitle>> {
        let audio = {
            // https://github.com/tazz4843/whisper-rs/pull/13/files
            let audio = Cursor::new(audio);
            let mut reader = hound::WavReader::new(audio).expect("failed to read wav");
            let hound::WavSpec {
                channels,
                sample_rate,
                ..
            } = reader.spec();

            let audio = whisper_rs::convert_integer_to_float_audio(
                &reader
                    .samples::<i16>()
                    .map(|s| s.expect("invalid sample"))
                    .collect::<Vec<_>>(),
            );

            if channels != 1 {
                panic!("expected one channel");
            }

            if sample_rate != 16000 {
                panic!("sample rate must be 16KHz");
            }

            audio
        };

        let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
        params.set_translate(true);
        params.set_language(Some("en"));
        params.set_print_special(false);
        params.set_print_progress(false);
        params.set_print_realtime(false);
        params.set_print_timestamps(false);

        let mut state = self.context.create_state()?;
        state.full(params, &audio[..])?;

        let mut subtitles = Vec::new();
        let num_segments = state.full_n_segments()?;
        for i in 0..num_segments {
            let segment = state.full_get_segment_text(i)?;
            let start_timestamp = state.full_get_segment_t0(i)?;
            let end_timestamp = state.full_get_segment_t1(i)?;

            subtitles.push(Subtitle {
                text: segment,
                start: start_timestamp,
                end: end_timestamp,
            });
        }

        Ok(subtitles)
    }
}
