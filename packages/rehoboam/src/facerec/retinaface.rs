use super::util::{distance2bbox, distance2kps, hard_nms, transpose_rgb};
use super::BoundBox;
use image::{imageops::FilterType, DynamicImage, GenericImageView, ImageBuffer, Rgba};
use ndarray::{Array3, Axis};
use ort::{Environment, Session, SessionBuilder, Value};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;

const NMS_THRESHOLD: f32 = 0.4;
const DET_THRESHOLD: f32 = 0.5;
const INPUT_MEAN: f32 = 127.5;
const INPUT_STD: f32 = 128.0;
const INPUT_SIZE: usize = 640;

pub struct RetinaFace {
    session: Session,
    fmc: usize,
    feat_stride_fpn: Vec<usize>,
    num_anchors: usize,
}

#[derive(Debug, Clone)]
pub struct FacePrediction {
    pub score: f32,
    pub bbox: BoundBox,
    pub landmarks: Vec<[f32; 2]>,
}

impl FacePrediction {
    pub fn landmarks_as_pixels(&self, image_size: (u32, u32)) -> Vec<[f32; 2]> {
        self.landmarks
            .iter()
            .map(|[x, y]| [x * image_size.0 as f32, y * image_size.1 as f32])
            .collect()
    }
}

impl RetinaFace {
    pub async fn init(environment: Arc<Environment>, model_path: PathBuf) -> anyhow::Result<Self> {
        let session = SessionBuilder::new(&environment)?.with_model_from_file(model_path)?;
        let outputs = &session.outputs;
        match outputs.len() {
            6 => Ok(Self {
                session,
                fmc: 3,
                feat_stride_fpn: vec![8, 16, 32],
                num_anchors: 2,
            }),
            9 => Ok(Self {
                session,
                fmc: 3,
                feat_stride_fpn: vec![8, 16, 32],
                num_anchors: 2,
            }),
            12 => Ok(Self {
                session,
                fmc: 5,
                feat_stride_fpn: vec![8, 16, 32, 64, 128],
                num_anchors: 1,
            }),
            15 => Ok(Self {
                session,
                fmc: 5,
                feat_stride_fpn: vec![8, 16, 32, 64, 128],
                num_anchors: 1,
            }),
            _ => Err(anyhow::anyhow!("Invalid number of outputs")),
        }
    }

    pub fn predict(&self, image_bytes: &[u8]) -> anyhow::Result<Vec<FacePrediction>> {
        let session = &self.session;
        let image = image::load_from_memory(image_bytes)?;
        let image_size = image.dimensions();
        let (input_tensor, scaled_size) = Self::preprocess(&image)?;

        let batched_tensor = input_tensor.insert_axis(Axis(0));
        let batched_tensor = batched_tensor.into_dyn().into();

        let input = Value::from_array(session.allocator(), &batched_tensor)?;
        let outputs = session.run(vec![input])?;

        self.postprocess(outputs, image_size, scaled_size)
    }

    fn postprocess(
        &self,
        outputs: Vec<Value>,
        original_size: (u32, u32),
        scaled_size: (u32, u32),
    ) -> anyhow::Result<Vec<FacePrediction>> {
        let mut center_cache = HashMap::new();
        let mut predictions = Vec::new();

        let scale_x = original_size.0 as f32 / scaled_size.0 as f32;
        let scale_y = original_size.1 as f32 / scaled_size.1 as f32;
        let scale = f32::max(scale_x, scale_y);

        for (idx, stride) in self.feat_stride_fpn.iter().enumerate() {
            let scores = outputs[idx].try_extract()?;
            let scores = scores.view();
            let scores = scores.as_slice().unwrap();

            let mut bbox_preds = outputs[idx + self.fmc]
                .try_extract()?
                .view()
                .as_slice()
                .unwrap()
                .to_vec();
            let mut kps_preds = outputs[idx + self.fmc * 2]
                .try_extract()?
                .view()
                .as_slice()
                .unwrap()
                .to_vec();

            for val in &mut bbox_preds {
                *val *= *stride as f32;
            }

            for val in &mut kps_preds {
                *val *= *stride as f32;
            }

            let height = INPUT_SIZE / *stride;
            let width = INPUT_SIZE / *stride;
            let key = format!("{}-{}-{}", height, width, stride);

            let anchor_centers = center_cache.entry(key).or_insert_with(|| {
                let mut centers = Vec::with_capacity(height * width * self.num_anchors);
                for i in 0..height {
                    for j in 0..width {
                        for k in 0..self.num_anchors {
                            centers.push([j as f32 * *stride as f32, i as f32 * *stride as f32]);
                        }
                    }
                }
                centers
            });

            let pos_inds: Vec<_> = scores
                .iter()
                .enumerate()
                .filter_map(|(i, &score)| if score > DET_THRESHOLD { Some(i) } else { None })
                .collect();

            let bboxes = distance2bbox(anchor_centers, &bbox_preds);
            let kpss = distance2kps(anchor_centers, &kps_preds);

            for &ind in &pos_inds {
                let bbox = &bboxes[ind];
                let kps = &kpss[ind];

                let original_width = original_size.0 as f32;
                let original_height = original_size.1 as f32;

                predictions.push(FacePrediction {
                    score: scores[ind],
                    bbox: BoundBox {
                        x1: (bbox[0] * scale) / original_width,
                        y1: (bbox[1] * scale) / original_height,
                        x2: (bbox[2] * scale) / original_width,
                        y2: (bbox[3] * scale) / original_height,
                    },
                    landmarks: kps
                        .chunks_exact(2)
                        .map(|kps| {
                            [
                                (kps[0] * scale) / original_width,
                                (kps[1] * scale) / original_height,
                            ]
                        })
                        .collect(),
                });
            }
        }

        predictions.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
        Ok(hard_nms(&predictions, NMS_THRESHOLD, 200))
    }

    fn normalize(input: f32) -> f32 {
        (input - INPUT_MEAN) / INPUT_STD
    }

    fn preprocess(image: &DynamicImage) -> anyhow::Result<(Array3<f32>, (u32, u32))> {
        let image = image.resize(INPUT_SIZE as u32, INPUT_SIZE as u32, FilterType::CatmullRom);
        let new_size = image.dimensions();
        let image = Self::pad_box(&image);

        let rgbs: Vec<f32> = image
            .pixels()
            .flat_map(|(_, _, pixel)| vec![pixel.0[0] as f32, pixel.0[1] as f32, pixel.0[2] as f32]) // excluding alpha value
            .collect();

        let mut rgbs = transpose_rgb(rgbs);

        let channel_length = rgbs.len() / 3;
        for i in 0..channel_length {
            rgbs[i] = Self::normalize(rgbs[i]);
            rgbs[i + channel_length] = Self::normalize(rgbs[i + channel_length]);
            rgbs[i + 2 * channel_length] = Self::normalize(rgbs[i + 2 * channel_length]);
        }

        let rgbs = Array3::from_shape_vec((3, INPUT_SIZE, INPUT_SIZE), rgbs).unwrap();
        Ok((rgbs, new_size))
    }

    fn pad_box(src: &DynamicImage) -> DynamicImage {
        let mut padded =
            ImageBuffer::from_pixel(INPUT_SIZE as u32, INPUT_SIZE as u32, Rgba([0, 0, 0, 255]));
        image::imageops::replace(&mut padded, src, 0, 0);
        DynamicImage::ImageRgba8(padded)
    }
}
