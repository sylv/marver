use std::{
    collections::HashMap,
    sync::{Arc, Mutex, RwLock},
    time::Duration,
};

use anyhow::Result;
use hf_hub::api::sync::{Api, ApiRepo};
use models::text::run_text_model;
use napi_derive::napi;
use ort::session::Session;
use tokio::time::{sleep, Instant};
use uluru::LRUCache;
use util::handle_result;

use crate::models::image::run_image_model;

mod models;
mod util;

type EmbeddingCache = LRUCache<(String, Vec<f32>), 1000>;

const MODEL_TIMEOUT_DURATION: Duration = Duration::from_secs(300);
const MODEL_CHECK_DURATION: Duration = Duration::from_secs(60);

#[napi]
pub struct SigLIP {
    vision_session: Arc<RwLock<Option<Arc<Session>>>>,
    text_session: Arc<RwLock<Option<Arc<Session>>>>,
    cached_embeddings: Arc<Mutex<EmbeddingCache>>,
    repo: ApiRepo,
    quantized: bool,
    last_vision_access: Arc<Mutex<Instant>>,
    last_text_access: Arc<Mutex<Instant>>,
}

#[napi]
impl SigLIP {
    #[napi(constructor)]
    pub fn new(quantized: bool) -> Result<Self> {
        let api = Api::new()?;
        let repo = api.model("Xenova/siglip-base-patch16-224".to_string());

        let now = Instant::now();
        let instance = Self {
            vision_session: Arc::new(RwLock::new(None)),
            text_session: Arc::new(RwLock::new(None)),
            cached_embeddings: Arc::new(Mutex::new(EmbeddingCache::default())),
            repo,
            quantized,
            last_vision_access: Arc::new(Mutex::new(now)),
            last_text_access: Arc::new(Mutex::new(now)),
        };

        instance.start_unload_task();

        Ok(instance)
    }

    fn start_unload_task(&self) {
        let vision_session = self.vision_session.clone();
        let text_session = self.text_session.clone();
        let last_vision_access = self.last_vision_access.clone();
        let last_text_access = self.last_text_access.clone();

        // unload models if they haven't been accessed in a while
        tokio::spawn(async move {
            loop {
                sleep(MODEL_CHECK_DURATION).await;

                let now = Instant::now();

                {
                    let last_access = last_vision_access.lock().unwrap();
                    if now.duration_since(*last_access) >= MODEL_TIMEOUT_DURATION {
                        let mut session = vision_session.write().unwrap();
                        if session.is_some() {
                            println!("Unloading vision session");
                        }
                        *session = None;
                    }
                }

                {
                    let last_access = last_text_access.lock().unwrap();
                    if now.duration_since(*last_access) >= MODEL_TIMEOUT_DURATION {
                        let mut session = text_session.write().unwrap();
                        if session.is_some() {
                            println!("Unloading text session");
                        }
                        *session = None;
                    }
                }
            }
        });
    }

    fn get_vision_session(&self) -> Result<Arc<Session>> {
        {
            let mut last_access = self.last_vision_access.lock().unwrap();
            *last_access = Instant::now();
        }

        {
            let existing = {
                let existing = self.vision_session.read().unwrap();
                existing.clone()
            };

            if let Some(session) = existing.as_ref() {
                println!("Returning existing vision session");
                return Ok(session.clone());
            }
        }

        println!("Creating new vision session");
        let mut write = self.vision_session.write().unwrap();
        let name = if self.quantized {
            "onnx/vision_model_quantized.onnx"
        } else {
            "onnx/vision_model.onnx"
        };

        let model_path = self.repo.get(name)?;
        let session = Arc::new(Session::builder()?.commit_from_file(&model_path)?);
        *write = Some(session.clone());

        Ok(session)
    }

    fn get_text_session(&self) -> Result<Arc<Session>> {
        {
            let mut last_access = self.last_text_access.lock().unwrap();
            *last_access = Instant::now();
        }

        {
            let existing = {
                let existing = self.text_session.read().unwrap();
                existing.clone()
            };

            if let Some(session) = existing.as_ref() {
                println!("Returning existing text session");
                return Ok(session.clone());
            }
        }

        println!("Creating new text session");
        let mut write = self.text_session.write().unwrap();
        let name = if self.quantized {
            "onnx/text_model_quantized.onnx"
        } else {
            "onnx/text_model.onnx"
        };

        let model_path = self.repo.get(name)?;
        let session = Arc::new(Session::builder()?.commit_from_file(&model_path)?);
        *write = Some(session.clone());

        Ok(session)
    }

    #[napi]
    pub async fn batch_encode_images(
        &self,
        image_paths: Vec<String>,
    ) -> napi::Result<Vec<Vec<f32>>> {
        let session = self.get_vision_session()?;
        let task = {
            let image_paths = image_paths.clone();
            tokio::spawn(async move { run_image_model(&session, image_paths) })
        };

        handle_result(task).await
    }

    #[napi]
    pub async fn batch_encode_texts(
        &self,
        texts: Vec<String>,
        cache_result: bool,
    ) -> napi::Result<Vec<Vec<f32>>> {
        let session = self.get_text_session()?;

        let mut text_embeddings_map = {
            let cached_embeddings = self.cached_embeddings.clone();
            let mut cache = cached_embeddings.lock().expect("Failed to lock cache");
            let mut map: HashMap<String, Option<Vec<f32>>> = HashMap::new();

            for text in &texts {
                let cached_embedding = cache.find(|e| &e.0 == text);
                map.insert(text.clone(), cached_embedding.map(|e| e.1.clone()));
            }

            map
        };

        let uncached_texts = text_embeddings_map
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
            return Ok(text_embeddings_map
                .values()
                .filter_map(|e| e.clone())
                .collect());
        }

        let task = tokio::spawn({
            let uncached_texts = uncached_texts.clone();
            async move { run_text_model(&session, uncached_texts) }
        });

        let encoded_uncached_texts = handle_result(task).await?;
        let mut cache = self.cached_embeddings.lock().expect("Failed to lock cache");
        for (text, embedding) in uncached_texts.iter().zip(encoded_uncached_texts.iter()) {
            text_embeddings_map.insert(text.clone(), Some(embedding.clone()));
            if cache_result {
                cache.insert((text.clone(), embedding.clone()));
            }
        }

        Ok(text_embeddings_map
            .values()
            .filter_map(|e| e.clone())
            .collect())
    }
}
