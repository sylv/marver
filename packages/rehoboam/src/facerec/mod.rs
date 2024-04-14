use self::{detection::FaceDetection, embedding::FaceEmbedding, face::Face};
use crate::error::handle_result;
use napi_derive::napi;
use std::sync::Arc;

pub mod detection;
mod embedding;
mod face;

#[napi(object)]
pub struct FaceRecognitionOptions {
    pub detection_model_path: String,
    pub embedding_model_path: String,
}

#[napi]
pub struct FaceRecognition {
    // todo: these keep the models in memory, they should be lazy loaded/unloaded like clip
    detection: Arc<FaceDetection>,
    embedding: Arc<FaceEmbedding>,
}

#[napi]
impl FaceRecognition {
    #[napi(constructor)]
    pub fn new(options: FaceRecognitionOptions) -> anyhow::Result<Self> {
        let detection = FaceDetection::new(options.detection_model_path)?;
        let embedding = FaceEmbedding::new(options.embedding_model_path)?;

        Ok(Self {
            detection: Arc::new(detection),
            embedding: Arc::new(embedding),
        })
    }

    #[napi]
    /// Predict faces in an image, returning the faces and embeddings.
    pub async fn predict(&self, image_path: String) -> napi::Result<Vec<Face>> {
        let face_det = self.detection.clone();
        let face_emb = self.embedding.clone();
        let task = tokio::spawn(async move {
            let image = image::io::Reader::open(image_path)?.decode()?;
            let faces = face_det.predict(&image)?;
            let embeddings = face_emb.predict(&image, faces)?;

            Ok(embeddings
                .into_iter()
                .map(|(prediction, embedding)| Face {
                    prediction,
                    embedding: embedding.into_iter().map(|v| v as f64).collect(),
                })
                .collect())
        });

        handle_result(task).await
    }
}
