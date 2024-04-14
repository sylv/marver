use super::detection::FacePrediction;
use crate::util::crop_with_alignment;
use image::{imageops::FilterType, DynamicImage};
use ndarray::{Array, Array4, CowArray, IxDyn};
use ort::{inputs, GraphOptimizationLevel, Session};

/// Implementation of ArcFace
/// It takes cropped images of aligned faces and returns embeddings.
pub struct FaceEmbedding {
    session: Session,
}

impl FaceEmbedding {
    pub fn new(model_path: String) -> anyhow::Result<Self> {
        let session = Session::builder()?
            .with_optimization_level(GraphOptimizationLevel::Level1)?
            .commit_from_file(model_path)?;

        Ok(Self { session })
    }

    pub fn predict(
        &self,
        image: &DynamicImage,
        faces: Vec<FacePrediction>,
    ) -> anyhow::Result<Vec<(FacePrediction, Vec<f32>)>> {
        let session = &self.session;
        let mut embeddings: Vec<(FacePrediction, Vec<f32>)> = Vec::new();

        for face in faces.iter() {
            // todo: batch inference
            let input_tensor = Self::preprocess(&image, face.clone())?;
            let outputs = session.run(inputs![&input_tensor]?)?;

            let embedding = outputs[0].try_extract_tensor::<f32>()?;
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
        let image = crop_with_alignment(image, &face, None);
        let image = image.resize_exact(112, 112, FilterType::CatmullRom);

        let image = image.to_rgb8();
        let image = Array4::from_shape_fn((1, 3, 112, 112), |(_, c, y, x)| {
            ((image[(x as u32, y as u32)][c] as f32 / 255.0) - 0.5) / 0.5
        });

        Ok(image.into_dyn().into())
    }
}
