use crate::{facerec::detection::FacePrediction, types::BoundBox};
use image::{imageops::crop_imm, DynamicImage, GenericImageView, Rgba};
use imageproc::geometric_transformations::{rotate, Interpolation};

fn area_of(bbox: &BoundBox) -> f64 {
    let x1 = bbox.x1;
    let y1 = bbox.y1;
    let x2 = bbox.x2;
    let y2 = bbox.y2;

    (x2 - x1) * (y2 - y1)
}

fn iou_of(bbox1: &BoundBox, bbox2: &BoundBox, eps: f64) -> f64 {
    let x1 = bbox1.x1.max(bbox2.x1);
    let y1 = bbox1.y1.max(bbox2.y1);
    let x2 = bbox1.x2.min(bbox2.x2);
    let y2 = bbox1.y2.min(bbox2.y2);

    let intersection = (x2 - x1).max(0.0) * (y2 - y1).max(0.0);
    let union = area_of(bbox1) + area_of(bbox2) - intersection;

    intersection / (union + eps)
}

pub(crate) fn hard_nms(
    faces: &[FacePrediction],
    iou_threshold: f64,
    candidate_size: usize,
) -> Vec<FacePrediction> {
    let mut picked: Vec<FacePrediction> = Vec::new();

    let mut faces = faces.to_vec();
    faces.sort_by(|a, b| a.score.partial_cmp(&b.score).unwrap().reverse());

    while !faces.is_empty() {
        let max_box = &faces[0].bbox;
        picked.push(faces[0].clone());

        if faces.is_empty() {
            break;
        }

        let mut rest: Vec<FacePrediction> = Vec::new();
        for face in faces.iter().skip(1) {
            let iou = iou_of(&face.bbox, max_box, 1e-5);
            if iou <= iou_threshold {
                rest.push(face.clone());
            }
        }

        if rest.len() < candidate_size {
            faces = rest;
        } else {
            faces = rest[0..candidate_size].to_vec();
        }
    }

    picked
}

pub(crate) fn distance2bbox(points: &[[f32; 2]], distance: &[f32]) -> Vec<Vec<f32>> {
    points
        .iter()
        .enumerate()
        .map(|(i, &point)| {
            vec![
                point[0] - distance[i * 4],
                point[1] - distance[i * 4 + 1],
                point[0] + distance[i * 4 + 2],
                point[1] + distance[i * 4 + 3],
            ]
        })
        .collect()
}

pub(crate) fn distance2kps(points: &[[f32; 2]], distance: &[f32]) -> Vec<Vec<f32>> {
    points
        .iter()
        .enumerate()
        .map(|(i, &point)| {
            (0..10)
                .map(|j| {
                    let idx = j % 2;
                    point[idx] + distance[i * 10 + j]
                })
                .collect()
        })
        .collect()
}

pub(crate) fn transpose_rgb(rgbs: Vec<f32>) -> Vec<f32> {
    let channel_length = rgbs.len() / 3;
    let mut out = vec![0.0; rgbs.len()];
    for i in 0..channel_length {
        out[i] = rgbs[i * 3];
        out[i + channel_length] = rgbs[i * 3 + 1];
        out[i + 2 * channel_length] = rgbs[i * 3 + 2];
    }
    out
}

/// Given a face, align it so it is "flat" based on the landmarks, then
/// crop based on the bounding box for that face.
pub(crate) fn crop_with_alignment(
    image: &DynamicImage,
    face: &FacePrediction,
    padding: Option<u32>,
) -> DynamicImage {
    let padding = padding.unwrap_or(0);

    let (width, height) = image.dimensions();
    let landmarks = face.landmarks_as_pixels((width, height));

    let left_eye = &landmarks[0];
    let right_eye = &landmarks[1];
    let angle = (right_eye.y - left_eye.y).atan2(right_eye.x - left_eye.x) as f32;

    let bbox_center = (
        ((face.bbox.x1 + face.bbox.x2) / 2.0 * width as f64) as f32,
        ((face.bbox.y1 + face.bbox.y2) / 2.0 * height as f64) as f32,
    );

    let image = image.to_rgba8();
    let image = rotate(
        &image,
        bbox_center,
        -angle,
        Interpolation::Bilinear,
        Rgba([0, 0, 0, 255]),
    );

    let (width, height) = image.dimensions();
    let x1 = (face.bbox.x1 * width as f64) as u32;
    let y1 = (face.bbox.y1 * height as f64) as u32;
    let x2 = (face.bbox.x2 * width as f64) as u32;
    let y2 = (face.bbox.y2 * height as f64) as u32;

    let sub_image = crop_imm(
        &image,
        x1 - padding,
        y1 - padding,
        x2 + padding,
        y2 + padding,
    );

    let image = sub_image.to_image();
    DynamicImage::ImageRgba8(image)
}
