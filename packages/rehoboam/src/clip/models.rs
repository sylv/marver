use std::path::PathBuf;

use crate::util::get_models_dir;

pub struct ClipModel {
    pub name: &'static str,
    pub visual_model: (&'static str, &'static str),
    pub textual_model: (&'static str, &'static str),
    pub tokenizer_url: &'static str,
    pub visual_size: usize,
    pub context_length: usize,
}

#[allow(clippy::excessive_precision)]
pub static CLIP_NORM_STD: [f32; 3] = [0.26862954, 0.26130258, 0.27577711];
pub static CLIP_NORM_MEAN: [f32; 3] = [0.48145466, 0.4578275, 0.40821073];

pub static CLIP_MODELS: [ClipModel; 1] = [
    ClipModel {
        name: "OpenAI/ViT-B-32",
        textual_model: ("https://huggingface.co/Marqo/onnx-open_clip-ViT-B-32/resolve/main/onnx32-open_clip-ViT-B-32-openai-textual.onnx", "c0bbb9684f45f12c60b808587ae0cb36"),
        visual_model: ("https://huggingface.co/Marqo/onnx-open_clip-ViT-B-32/resolve/main/onnx32-open_clip-ViT-B-32-openai-visual.onnx", "c5c6da5d72651d8a1910152379813afa"),
        tokenizer_url: "https://huggingface.co/openai/clip-vit-base-patch32/raw/main/tokenizer.json",
        context_length: 77,
        visual_size: 224,
    },
];

impl ClipModel {
    pub fn get_cache_dir(&self) -> PathBuf {
        let mut base = get_models_dir();
        base.push("clip");
        base.push(self.name.replace('/', "-"));
        base
    }
}
