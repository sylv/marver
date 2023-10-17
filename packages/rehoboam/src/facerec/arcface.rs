use image::{imageops::FilterType, DynamicImage};
use ndarray::{Array, Array4, CowArray, IxDyn};
use ort::{tensor::OrtOwnedTensor, Environment, Session, SessionBuilder, Value};
use std::{path::PathBuf, sync::Arc};

use super::{retinaface::FacePrediction, util::crop_with_alignment};

pub struct ArcFace {
    session: Session,
}

impl ArcFace {
    pub async fn init(environment: Arc<Environment>, model_path: PathBuf) -> anyhow::Result<Self> {
        let session = SessionBuilder::new(&environment)?.with_model_from_file(model_path)?;
        Ok(Self { session })
    }

    pub fn predict(
        &self,
        image_bytes: &[u8],
        faces: Vec<FacePrediction>,
    ) -> anyhow::Result<Vec<(FacePrediction, Vec<f32>)>> {
        let session = &self.session;
        let image = image::load_from_memory(image_bytes)?;
        let mut embeddings: Vec<(FacePrediction, Vec<f32>)> = Vec::new();

        for face in faces.iter() {
            // todo: batch inference
            let input_tensor = Self::preprocess(&image, face.clone())?;
            let input = Value::from_array(session.allocator(), &input_tensor)?;
            let outputs = session.run(vec![input])?;

            let embedding: OrtOwnedTensor<f32, _> = outputs[0].try_extract()?;
            let embedding = embedding.view();
            let embedding = embedding.to_slice().unwrap().to_vec();
            let embedding = Self::normalize_embedding(embedding);
            embeddings.push((face.clone(), embedding));
        }

        Ok(embeddings)
    }

    fn normalize_embedding(embedding: Vec<f32>) -> Vec<f32> {
        let embedding = Array::from(embedding);
        let l2_norm = f32::sqrt(embedding.mapv(|v| v * v).sum());
        let normalized_embedding = embedding.mapv(|v| v / l2_norm);
        normalized_embedding.to_vec()
    }

    fn preprocess(
        image: &DynamicImage,
        face: FacePrediction,
    ) -> anyhow::Result<CowArray<f32, IxDyn>> {
        let image = crop_with_alignment(image, &face);
        let image = image.resize_exact(112, 112, FilterType::CatmullRom);

        let image = image.to_rgb8();
        let image = Array4::from_shape_fn((1, 3, 112, 112), |(_, c, y, x)| {
            ((image[(x as u32, y as u32)][c] as f32 / 255.0) - 0.5) / 0.5
        });

        Ok(image.into_dyn().into())
    }
}
