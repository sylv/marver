use crate::types::{BoundBox, Landmark};
use crate::util::{distance2bbox, distance2kps, hard_nms, transpose_rgb};
use image::{imageops::FilterType, DynamicImage, GenericImageView, ImageBuffer, Rgba};
use napi_derive::napi;
use ndarray::{Array3, Axis};
use ort::{inputs, GraphOptimizationLevel, Session, SessionOutputs};
use std::collections::HashMap;

const NMS_THRESHOLD: f64 = 0.4;
const DET_THRESHOLD: f32 = 0.5;
const INPUT_MEAN: f32 = 127.5;
const INPUT_STD: f32 = 128.0;
const INPUT_SIZE: usize = 640;

#[derive(Debug, Clone)]
#[napi(object)]
pub struct FacePrediction {
    pub score: f64,
    pub bbox: BoundBox,
    pub landmarks: Vec<Landmark>,
}

impl FacePrediction {
    pub fn landmarks_as_pixels(&self, image_size: (u32, u32)) -> Vec<Landmark> {
        self.landmarks
            .iter()
            .map(|landmark| Landmark {
                x: landmark.x * image_size.0 as f64,
                y: landmark.y * image_size.1 as f64,
            })
            .collect()
    }
}

/// Implementation of RetinaFace
/// It finds faces in images, returning a bounding box and key points (eyes, mouth, etc)
pub struct FaceDetection {
    session: Session,
    fmc: usize,
    feat_stride_fpn: Vec<usize>,
    num_anchors: usize,
}

impl FaceDetection {
    pub(crate) fn new(model_path: String) -> anyhow::Result<Self> {
        let session = Session::builder()?
            .with_optimization_level(GraphOptimizationLevel::Level1)?
            .commit_from_file(model_path)?;

        let outputs = &session.outputs;
        match outputs.len() {
            6 | 9 => Ok(Self {
                session,
                fmc: 3,
                feat_stride_fpn: vec![8, 16, 32],
                num_anchors: 2,
            }),
            12 | 15 => Ok(Self {
                session,
                fmc: 5,
                feat_stride_fpn: vec![8, 16, 32, 64, 128],
                num_anchors: 1,
            }),
            _ => Err(anyhow::anyhow!("Invalid number of outputs")),
        }
    }

    pub(crate) fn predict(&self, image: &DynamicImage) -> anyhow::Result<Vec<FacePrediction>> {
        let session = &self.session;

        let image_size = image.dimensions();
        let (input_tensor, scaled_size) = Self::preprocess(&image)?;

        // todo: support batching
        let batched_tensor = input_tensor.insert_axis(Axis(0));
        let outputs = session.run(inputs![batched_tensor]?)?;

        self.postprocess(outputs, image_size, scaled_size)
    }

    fn postprocess(
        &self,
        outputs: SessionOutputs,
        original_size: (u32, u32),
        scaled_size: (u32, u32),
    ) -> anyhow::Result<Vec<FacePrediction>> {
        let mut center_cache = HashMap::new();
        let mut predictions = Vec::new();

        let scale_x = original_size.0 as f32 / scaled_size.0 as f32;
        let scale_y = original_size.1 as f32 / scaled_size.1 as f32;
        let scale = f32::max(scale_x, scale_y);

        for (idx, stride) in self.feat_stride_fpn.iter().enumerate() {
            let scores = outputs[idx].try_extract_tensor()?;
            let scores = scores.view();
            let scores: &[f32] = scores.as_slice().unwrap();

            let mut bbox_preds: Vec<f32> = outputs[idx + self.fmc]
                .try_extract_tensor()?
                .view()
                .as_slice()
                .unwrap()
                .to_vec();
            let mut kps_preds: Vec<f32> = outputs[idx + self.fmc * 2]
                .try_extract_tensor()?
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
                        for _ in 0..self.num_anchors {
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
                    score: scores[ind] as f64,
                    bbox: BoundBox {
                        x1: ((bbox[0] * scale) / original_width) as f64,
                        y1: ((bbox[1] * scale) / original_height) as f64,
                        x2: ((bbox[2] * scale) / original_width) as f64,
                        y2: ((bbox[3] * scale) / original_height) as f64,
                    },
                    landmarks: kps
                        .chunks_exact(2)
                        .map(|kps| Landmark {
                            x: ((kps[0] * scale) / original_width) as f64,
                            y: ((kps[1] * scale) / original_height) as f64,
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
