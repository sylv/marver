use std::{
    collections::HashMap,
    sync::{Arc, Mutex, RwLock},
};

use anyhow::Result;
use hf_hub::api::sync::{Api, ApiRepo};
use models::text::run_text_model;
use napi_derive::napi;
use ort::Session;
use uluru::LRUCache;
use util::handle_result;

use crate::models::image::run_image_model;

mod models;
mod util;

type EmbeddingCache = LRUCache<(String, Vec<f32>), 100>;

#[napi]
pub struct SigLIP {
    vision_session: RwLock<Option<Arc<Session>>>,
    text_session: RwLock<Option<Arc<Session>>>,
    cached_embeddings: Mutex<EmbeddingCache>,
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
            vision_session: RwLock::new(None),
            text_session: RwLock::new(None),
            cached_embeddings: Mutex::new(EmbeddingCache::default()),
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

        match self.vision_session.read().unwrap().as_ref().cloned() {
            Some(session) => Ok(session),
            None => {
                let mut write = self.vision_session.write().unwrap();
                let model_path = self.repo.get(name)?;
                let session = Arc::new(Session::builder()?.commit_from_file(&model_path)?);
                *write = Some(session.clone());

                Ok(session)
            }
        }
    }

    fn get_text_session(&self) -> Result<Arc<Session>> {
        let name = if self.quantized {
            "onnx/text_model_quantized.onnx"
        } else {
            "onnx/text_model.onnx"
        };

        match self.text_session.read().unwrap().as_ref().cloned() {
            Some(session) => Ok(session),
            None => {
                let mut write = self.text_session.write().unwrap();
                let model_path = self.repo.get(name)?;
                let session = Arc::new(Session::builder()?.commit_from_file(&model_path)?);
                *write = Some(session.clone());

                Ok(session)
            }
        }
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
    pub async fn batch_encode_texts(
        &self,
        texts: Vec<String>,
        cache_result: Option<bool>,
    ) -> napi::Result<Vec<Vec<f32>>> {
        let mut mapped_texts = {
            let mut cache = self.cached_embeddings.lock().expect("Failed to lock cache");
            let mut map: HashMap<String, Option<Vec<f32>>> = HashMap::new();

            for text in &texts {
                let cached_embedding = cache.find(|e| &e.0 == text);
                map.insert(text.clone(), cached_embedding.map(|e| e.1.clone()));
            }

            map
        };

        let uncached_texts = mapped_texts
            .iter()
            .filter_map(|(path, embedding)| {
                if embedding.is_none() {
                    Some(path.clone())
                } else {
                    None
                }
            })
            .collect::<Vec<String>>();

        if uncached_texts.is_empty() {
            return Ok(mapped_texts.values().filter_map(|e| e.clone()).collect());
        }

        let session = self.get_text_session()?;
        let task = tokio::spawn({
            let uncached_texts = uncached_texts.clone();
            async move { run_text_model(&session, uncached_texts) }
        });

        let encoded_uncached_texts = handle_result(task).await?;
        let mut cache = self.cached_embeddings.lock().expect("Failed to lock cache");
        for (text, embedding) in uncached_texts.iter().zip(encoded_uncached_texts.iter()) {
            mapped_texts.insert(text.clone(), Some(embedding.clone()));
            if cache_result.unwrap_or(false) {
                cache.insert((text.clone(), embedding.clone()));
            }
        }

        Ok(mapped_texts.values().filter_map(|e| e.clone()).collect())
    }

    #[napi]
    pub fn unload_textual_session(&self) {
        let mut write = self.text_session.write().unwrap();
        *write = None;
    }

    #[napi]
    pub fn unload_visual_session(&self) {
        let mut write = self.vision_session.write().unwrap();
        *write = None;
    }
}
