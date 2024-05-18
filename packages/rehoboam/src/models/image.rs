use anyhow::Result;
use image::imageops::FilterType;
use ndarray::{Array3, Array4};
use ort::{inputs, Session};

// https://huggingface.co/Xenova/siglip-base-patch16-224/blob/main/preprocessor_config.json
static VISION_SIZE: usize = 224;
static IMAGE_STD: f32 = 0.5;
static IMAGE_MEAN: f32 = 0.5;

pub fn preprocess_image(image_path: String) -> Result<Array3<f32>> {
    let image = image::io::Reader::open(image_path)?.decode()?;

    let image = image.resize_exact(
        VISION_SIZE as u32,
        VISION_SIZE as u32,
        // todo: this is one of the slowest parts of the pipeline, but other faster filters
        // destroy image quality and make text in the image unreadable.
        // fast_image_resize or libvips might be a good option
        FilterType::CatmullRom,
    );

    let image = image.to_rgb32f();
    let image = image.into_raw();

    let tensor = Array3::from_shape_vec((VISION_SIZE, VISION_SIZE, 3), image)?;
    let tensor = tensor.permuted_axes([2, 0, 1]);
    let tensor = tensor - IMAGE_MEAN;
    let tensor = tensor / IMAGE_STD;

    Ok(tensor)
}

// model input is float32[batch_size,num_channels,height,width]
// model output is float32[batch_size,768]
pub fn run_image_model(session: &Session, image_paths: Vec<String>) -> Result<Vec<Vec<f32>>> {
    let mut batch = vec![];
    for image_path in image_paths {
        // todo: multithreading this might make sense?
        let tensor = preprocess_image(image_path)?;
        batch.push(tensor);
    }

    let batch = Array4::from_shape_vec(
        (batch.len(), 3, VISION_SIZE, VISION_SIZE),
        batch.into_iter().flatten().collect(),
    )?;

    let outputs = session.run(inputs![batch]?)?;
    let embeddings = outputs
        .get("pooler_output")
        .expect("unexpected model output")
        .try_extract_tensor::<f32>()?;

    Ok(embeddings
        .rows()
        .into_iter()
        .map(|lane| lane.into_iter().copied().collect())
        .collect())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    pub fn cosine_similarity(a: &Vec<f64>, b: &Vec<f64>) -> f64 {
        let dot_product = a.iter().zip(b.iter()).map(|(a, b)| a * b).sum::<f64>();
        let norm_a = a.iter().map(|x| x.powi(2)).sum::<f64>().sqrt();
        let norm_b = b.iter().map(|x| x.powi(2)).sum::<f64>().sqrt();

        dot_product / (norm_a * norm_b)
    }

    #[test]
    fn test_preprocess_image() {
        let test_image_dir = env!("CARGO_MANIFEST_DIR").to_string() + "/test/images";
        let source_embeddings: HashMap<String, Vec<f64>> =
            serde_json::from_str(include_str!("../../source_embeddings.json")).unwrap();

        let model_path = std::env::var("TEST_VISION_MODEL_PATH").unwrap();
        let session = Session::builder()
            .unwrap()
            .commit_from_file(&model_path)
            .unwrap();

        let mut scores = vec![];
        for (image_name, source_embedding) in &source_embeddings {
            let image_path = test_image_dir.clone() + "/" + &image_name;
            let our_embedding = run_image_model(&session, vec![image_path.clone()]).unwrap();
            let our_embedding = our_embedding.into_iter().next().unwrap();
            let our_embedding = our_embedding
                .iter()
                .map(|v| *v as f64)
                .collect::<Vec<f64>>();

            let score = cosine_similarity(source_embedding, &our_embedding);
            println!("{}: SCORE {}", image_path, score);
            scores.push(score);
        }

        let avg_score: f64 = scores.iter().sum::<f64>() / scores.len() as f64;
        println!("AVERAGE SCORE: {}", avg_score);
    }
}
