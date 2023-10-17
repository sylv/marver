use image::{imageops::FilterType, GenericImageView};
use itertools::Itertools;
use ndarray::{Array2, Array4, CowArray, Dim};
use ort::{Environment, Session, SessionBuilder, Value};
use std::path::Path;
use std::sync::Arc;
use tokenizers::{PaddingParams, PaddingStrategy, Tokenizer, TruncationParams};

use self::models::{ClipModel, CLIP_MODELS, CLIP_NORM_MEAN, CLIP_NORM_STD};
use crate::util::ensure_file;

mod models;

pub struct Clip {
    tokenizer: Tokenizer,
    visual_session: Session,
    textual_session: Session,
    vision_size: usize,
}

impl Clip {
    pub async fn init(environment: Arc<Environment>) -> anyhow::Result<Self> {
        let model = &CLIP_MODELS[0]; // todo: should be configurable
        let cache_path = model.get_cache_dir();
        let vision_size = model.visual_size;

        let tokenizer = Clip::init_tokenizer(&cache_path, model).await?;
        let visual_session = Clip::init_visual_session(&cache_path, model, &environment).await?;
        let textual_session = Clip::init_textual_session(&cache_path, model, environment).await?;

        Ok(Self {
            tokenizer,
            visual_session,
            textual_session,
            vision_size,
        })
    }

    async fn init_textual_session(
        cache_path: &Path,
        model: &ClipModel,
        environment: Arc<Environment>,
    ) -> anyhow::Result<Session> {
        let textual_path = cache_path.join("textual.onnx");

        let model_url = models::BUCKET_URL.to_owned() + model.textual_model.0;
        ensure_file(&model_url, &textual_path, Some(model.textual_model.1)).await?;

        // todo: from what ive seen, with_parallel_execution has little effect on performance,
        // and sometimes makes it worse. but that might be setup-specific, something to look
        // into/expose as an option?
        let textual_session =
            SessionBuilder::new(&environment)?.with_model_from_file(textual_path)?;

        Ok(textual_session)
    }

    async fn init_visual_session(
        cache_path: &Path,
        model: &ClipModel,
        environment: &Arc<Environment>,
    ) -> anyhow::Result<Session> {
        let visual_path = cache_path.join("visual.onnx");

        let model_url = models::BUCKET_URL.to_owned() + model.visual_model.0;
        ensure_file(&model_url, &visual_path, Some(model.visual_model.1)).await?;

        let visual_session = SessionBuilder::new(environment)?.with_model_from_file(visual_path)?;
        Ok(visual_session)
    }

    async fn init_tokenizer(cache_path: &Path, model: &ClipModel) -> anyhow::Result<Tokenizer> {
        let tokenizer_path = cache_path.join("tokenizer.json");

        ensure_file(model.tokenizer_url, &tokenizer_path, None).await?;

        let mut tokenizer = Tokenizer::from_file(tokenizer_path).expect("failed to load tokenizer");
        tokenizer
            .with_padding(Some(PaddingParams {
                strategy: PaddingStrategy::Fixed(model.context_length),
                ..Default::default()
            }))
            .with_truncation(Some(TruncationParams {
                max_length: model.context_length,
                ..Default::default()
            }))
            .expect("failed to setup tokenizer");
        Ok(tokenizer)
    }

    pub fn encode_text(&self, text: &Vec<&str>) -> anyhow::Result<Vec<Vec<f32>>> {
        let preprocessed = self
            .tokenizer
            .encode_batch(text.clone(), true)
            .expect("failed to encode text");

        let v1: Vec<i32> = preprocessed
            .iter()
            .map(|i| i.get_ids().iter().map(|b| *b as i32).collect())
            .concat();
        let v2: Vec<i32> = preprocessed
            .iter()
            .map(|i| i.get_attention_mask().iter().map(|b| *b as i32).collect())
            .concat();

        let ids = CowArray::from(Array2::from_shape_vec(
            (text.len(), v1.len() / text.len()),
            v1,
        )?)
        .into_dyn();
        let mask = CowArray::from(Array2::from_shape_vec(
            (text.len(), v2.len() / text.len()),
            v2,
        )?)
        .into_dyn();

        let session = &self.textual_session;
        let outputs = session.run(vec![
            Value::from_array(session.allocator(), &ids)?,
            Value::from_array(session.allocator(), &mask)?,
        ])?;

        let binding = outputs[0].try_extract()?;
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

    pub fn encode_image(&self, image_bytes: &Vec<Vec<u8>>) -> anyhow::Result<Vec<Vec<f32>>> {
        let mut pixels = CowArray::from(Array4::<f32>::zeros(Dim([
            image_bytes.len(),
            3,
            self.vision_size,
            self.vision_size,
        ])));

        for (index, image_bytes) in image_bytes.iter().enumerate() {
            let image = image::load_from_memory(image_bytes)?;
            let image = image.resize_exact(
                self.vision_size as u32,
                self.vision_size as u32,
                FilterType::CatmullRom,
            );

            for (x, y, pixel) in image.pixels() {
                pixels[[index, 0, x as usize, y as usize]] =
                    (pixel.0[0] as f32 / 255.0 - CLIP_NORM_MEAN[0]) / CLIP_NORM_STD[0];
                pixels[[index, 1, x as usize, y as usize]] =
                    (pixel.0[1] as f32 / 255.0 - CLIP_NORM_MEAN[1]) / CLIP_NORM_STD[1];
                pixels[[index, 2, x as usize, y as usize]] =
                    (pixel.0[2] as f32 / 255.0 - CLIP_NORM_MEAN[2]) / CLIP_NORM_STD[2];
            }
        }

        let session = &self.visual_session;
        let outputs = session.run(vec![Value::from_array(
            session.allocator(),
            &pixels.into_dyn(),
        )?])?;

        let binding = outputs[0].try_extract()?;
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
