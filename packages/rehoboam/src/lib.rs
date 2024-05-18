use std::sync::Arc;

use anyhow::Result;
use hf_hub::api::sync::{Api, ApiRepo};
use lazy_rc::LazyArc;
use models::text::run_text_model;
use napi_derive::napi;
use ort::Session;
use util::handle_result;

use crate::models::image::run_image_model;

mod models;
mod util;

#[napi]
pub struct SigLIP {
    vision_session: LazyArc<Session>,
    text_session: LazyArc<Session>,
    repo: ApiRepo,
    quantized: bool,
}

#[napi]
impl SigLIP {
    #[napi(constructor)]
    pub fn new(quantized: bool) -> Result<Self> {
        let api = Api::new()?;
        let repo = api.model("Xenova/siglip-base-patch16-224".to_string());

        Ok(Self {
            vision_session: LazyArc::empty(),
            text_session: LazyArc::empty(),
            repo,
            quantized,
        })
    }

    fn get_vision_session(&self) -> Result<Arc<Session>> {
        let name = if self.quantized {
            "onnx/vision_model_quantized.onnx"
        } else {
            "onnx/vision_model.onnx"
        };

        self.vision_session.or_try_init_with(|| {
            let model_path = self.repo.get(name)?;
            Ok(Session::builder()?.commit_from_file(&model_path)?)
        })
    }

    fn get_text_session(&self) -> Result<Arc<Session>> {
        let name = if self.quantized {
            "onnx/text_model_quantized.onnx"
        } else {
            "onnx/text_model.onnx"
        };

        self.text_session.or_try_init_with(|| {
            let model_path = self.repo.get(name)?;
            Ok(Session::builder()?.commit_from_file(&model_path)?)
        })
    }

    #[napi]
    pub async fn batch_encode_images(
        &self,
        image_paths: Vec<String>,
    ) -> napi::Result<Vec<Vec<f32>>> {
        let session = self.get_vision_session()?;
        let task = tokio::spawn(async move { run_image_model(&session, image_paths) });

        handle_result(task).await
    }

    #[napi]
    pub async fn batch_encode_texts(&self, texts: Vec<String>) -> napi::Result<Vec<Vec<f32>>> {
        let session = self.get_text_session()?;
        let task = tokio::spawn(async move { run_text_model(&session, texts) });

        handle_result(task).await
    }

    #[napi]
    pub fn unload_textual_session(&mut self) {
        self.text_session.take();
    }

    #[napi]
    pub fn unload_visual_session(&mut self) {
        self.vision_session.take();
    }
}
