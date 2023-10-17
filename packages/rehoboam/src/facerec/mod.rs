use std::path::PathBuf;

use crate::util::{ensure_zip, get_models_dir};

pub mod arcface;
pub mod retinaface;
mod util;

#[derive(Debug, Clone)]
pub struct BoundBox {
    pub x1: f32,
    pub y1: f32,
    pub x2: f32,
    pub y2: f32,
}

impl BoundBox {
    pub fn to_xyxy(&self, width: u32, height: u32) -> (u32, u32, u32, u32) {
        let x1 = (self.x1 * width as f32) as u32;
        let y1 = (self.y1 * height as f32) as u32;
        let x2 = (self.x2 * width as f32) as u32;
        let y2 = (self.y2 * height as f32) as u32;
        (x1, y1, x2, y2)
    }
}

impl TryInto<BoundBox> for &[f32] {
    type Error = anyhow::Error;

    fn try_into(self) -> Result<BoundBox, Self::Error> {
        if self.len() != 4 {
            return Err(anyhow::anyhow!(
                "Expected 4 elements in slice, got {}",
                self.len()
            ));
        }

        Ok(BoundBox {
            x1: self[0],
            y1: self[1],
            x2: self[2],
            y2: self[3],
        })
    }
}

// todo: should be configurable
const MODEL_ZIP_MD5: &str = "6c0e929fd3b6ab517170b732ced18c68";
const MODEL_ZIP_URL: &str =
    "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip";

pub async fn download_models() -> anyhow::Result<(PathBuf, PathBuf)> {
    let mut base = get_models_dir();
    base.push("facerec");
    base.push("buffalo_l");

    let files = ensure_zip(MODEL_ZIP_URL, &base, Some(MODEL_ZIP_MD5), |f| {
        let file_name = f.file_name().unwrap().to_str().unwrap();
        file_name.starts_with("det_") || file_name.starts_with("w600k_")
    })
    .await?;

    let det_model = files
        .iter()
        .find(|f| f.file_name().unwrap().to_str().unwrap().starts_with("det_"))
        .unwrap();
    let rec_model = files
        .iter()
        .find(|f| {
            f.file_name()
                .unwrap()
                .to_str()
                .unwrap()
                .starts_with("w600k_")
        })
        .unwrap();

    if !det_model.exists() || !rec_model.exists() {
        return Err(anyhow::anyhow!(
            "Missing expected model files in unzipped package"
        ));
    }

    Ok((det_model.clone(), rec_model.clone()))
}
