use std::sync::Arc;

use anyhow::Result;
use image::{imageops::FilterType, GenericImageView};
use itertools::Itertools;
use lazy_rc::LazyArc;
use napi_derive::napi;
use ndarray::{Array2, Array4, Dim};
use ort::{inputs, Session};
use tokenizers::{PaddingParams, PaddingStrategy, Tokenizer, TruncationParams};

use crate::error::handle_result;

#[allow(clippy::excessive_precision)]
static CLIP_NORM_STD: [f32; 3] = [0.26862954, 0.26130258, 0.27577711];
static CLIP_NORM_MEAN: [f32; 3] = [0.48145466, 0.4578275, 0.40821073];

#[napi(object)]
pub struct ClipOptions {
    pub vision_model_path: String,
    pub text_model_path: String,
    pub tokenizer_path: String,
    pub context_length: u32,
    pub vision_size: u32,
}

#[napi]
pub struct Clip {
    tokenizer: Arc<Tokenizer>,
    visual_session: LazyArc<Session>,
    textual_session: LazyArc<Session>,
    vision_size: usize,
    options: ClipOptions,
}

#[napi]
impl Clip {
    #[napi(constructor)]
    pub fn new(options: ClipOptions) -> Result<Self> {
        let context_length = options.context_length as usize;
        let vision_size = options.vision_size as usize;

        let tokenizer = {
            let mut tokenizer =
                Tokenizer::from_file(&options.tokenizer_path).expect("failed to load tokenizer");
            tokenizer
                .with_padding(Some(PaddingParams {
                    strategy: PaddingStrategy::Fixed(context_length),
                    ..Default::default()
                }))
                .with_truncation(Some(TruncationParams {
                    max_length: context_length,
                    ..Default::default()
                }))
                .expect("failed to setup tokenizer");

            tokenizer
        };

        Ok(Self {
            visual_session: LazyArc::empty(),
            textual_session: LazyArc::empty(),
            tokenizer: Arc::new(tokenizer),
            vision_size,
            options,
        })
    }

    fn get_visual_session(&self) -> Result<Arc<Session>> {
        self.visual_session.or_try_init_with(|| {
            Ok(Session::builder()?.commit_from_file(&self.options.vision_model_path)?)
        })
    }

    fn get_textual_session(&self) -> Result<Arc<Session>> {
        self.textual_session.or_try_init_with(|| {
            Ok(Session::builder()?.commit_from_file(&self.options.text_model_path)?)
        })
    }

    #[napi]
    pub fn unload_textual_session(&mut self) {
        self.textual_session.take();
    }

    #[napi]
    pub fn unload_visual_session(&mut self) {
        self.visual_session.take();
    }

    #[napi]
    pub async fn batch_encode_text(&self, text: Vec<String>) -> napi::Result<Vec<Vec<f32>>> {
        let session = self.get_textual_session()?;
        let tokenizer = self.tokenizer.clone();
        let task =
            tokio::spawn(async move { Self::batch_encode_text_inner(text, session, tokenizer) });

        handle_result(task).await
    }

    #[napi]
    pub async fn batch_encode_images(
        &self,
        image_paths: Vec<String>,
    ) -> napi::Result<Vec<Vec<f32>>> {
        let session = self.get_visual_session()?;
        let vision_size = self.vision_size;
        let task = tokio::spawn(async move {
            Self::batch_encode_images_inner(image_paths, session, vision_size)
        });

        handle_result(task).await
    }

    fn batch_encode_text_inner(
        text: Vec<String>,
        session: Arc<Session>,
        tokenizer: Arc<Tokenizer>,
    ) -> Result<Vec<Vec<f32>>> {
        let batch_size = text.len();
        let preprocessed = tokenizer
            .encode_batch(text, true)
            .expect("failed to tokenize text");

        let v1: Vec<i64> = preprocessed
            .iter()
            .map(|i| i.get_ids().iter().map(|b| *b as i64).collect())
            .concat();

        let ids = Array2::from_shape_vec((batch_size, v1.len() / batch_size), v1)?;

        let outputs = session.run(inputs![ids]?)?;
        let binding = outputs[0].try_extract_tensor()?;
        let embeddings = binding.view();

        let seq_len = embeddings.shape().get(1).unwrap();

        Ok(embeddings
            .iter()
            .copied()
            .chunks(*seq_len)
            .into_iter()
            .map(|b| b.collect())
            .collect())
    }

    fn batch_encode_images_inner(
        image_paths: Vec<String>,
        session: Arc<Session>,
        vision_size: usize,
    ) -> Result<Vec<Vec<f32>>> {
        let mut pixels =
            Array4::<f32>::zeros(Dim([image_paths.len(), 3, vision_size, vision_size]));

        for (index, image_path) in image_paths.iter().enumerate() {
            let image = {
                let image = image::io::Reader::open(image_path)?.decode()?;
                image.resize_exact(
                    vision_size as u32,
                    vision_size as u32,
                    FilterType::CatmullRom,
                )
            };

            for (x, y, pixel) in image.pixels() {
                pixels[[index, 0, x as usize, y as usize]] =
                    (pixel.0[0] as f32 / 255.0 - CLIP_NORM_MEAN[0]) / CLIP_NORM_STD[0];
                pixels[[index, 1, x as usize, y as usize]] =
                    (pixel.0[1] as f32 / 255.0 - CLIP_NORM_MEAN[1]) / CLIP_NORM_STD[1];
                pixels[[index, 2, x as usize, y as usize]] =
                    (pixel.0[2] as f32 / 255.0 - CLIP_NORM_MEAN[2]) / CLIP_NORM_STD[2];
            }
        }

        let outputs = session.run(inputs![pixels]?)?;
        let binding = outputs[0].try_extract_tensor()?;
        let embeddings = binding.view();
        let seq_len = embeddings.shape().get(1).unwrap();

        Ok(embeddings
            .iter()
            .copied()
            .chunks(*seq_len)
            .into_iter()
            .map(|b| b.collect())
            .collect())
    }
}
