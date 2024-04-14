use crate::util::crop_with_alignment;

use super::detection::FacePrediction;
use image::DynamicImage;
use napi_derive::napi;

#[derive(Debug)]
#[napi(object)]
pub struct Face {
    pub prediction: FacePrediction,
    pub embedding: Vec<f64>,
}

impl Face {
    pub fn get_preview(&self, image_path: &str) -> anyhow::Result<DynamicImage> {
        let image = image::open(image_path)?;
        Ok(crop_with_alignment(&image, &self.prediction, Some(25)))
    }
}
