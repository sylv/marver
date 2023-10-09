use std::path::PathBuf;

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

pub static BUCKET_URL: &str = "https://clip-as-service.s3.us-east-2.amazonaws.com/models-436c69702d61732d53657276696365/onnx/";
pub static CLIP_MODELS: [ClipModel; 4] = [
    ClipModel {
        name: "OpenAI/ViT-B-32",
        visual_model: ("ViT-B-32/textual.onnx", "bd6d7871e8bb95f3cc83aff3398d7390"),
        textual_model: ("ViT-B-32/visual.onnx", "88c6f38e522269d6c04a85df18e6370c"),
        tokenizer_url: "https://huggingface.co/openai/clip-vit-base-patch32/raw/main/tokenizer.json",
        context_length: 77,
        visual_size: 224,
    },
    ClipModel {
        name: "OpenAI/ViT-B-16",
        visual_model: ("ViT-B-16/textual.onnx", "6f0976629a446f95c0c8767658f12ebe"),
        textual_model: ("ViT-B-16/visual.onnx", "d5c03bfeef1abbd9bede54a8f6e1eaad"),
        tokenizer_url: "https://huggingface.co/openai/clip-vit-base-patch16/raw/main/tokenizer.json",
        context_length: 77,
        visual_size: 224,
    },
    ClipModel {
        name: "OpenAI/ViT-L-14",
        visual_model: ("ViT-L-14/textual.onnx", "325380b31af4837c2e0d9aba2fad8e1b"),
        textual_model: ("ViT-L-14/visual.onnx", "53f5b319d3dc5d42572adea884e31056"),
        tokenizer_url: "https://huggingface.co/sentence-transformers/clip-ViT-L-14/raw/main/0_CLIPModel/tokenizer.json",
        context_length: 77,
        visual_size: 224,
    },
    ClipModel {
        name: "OpenAI/ViT-L-14-336",
        visual_model: (
            "ViT-L-14-336/textual.onnx",
            "78fab479f136403eed0db46f3e9e7ed2",
        ),
        textual_model: (
            "ViT-L-14-336/visual.onnx",
            "f3b1f5d55ca08d43d749e11f7e4ba27e",
        ),
        tokenizer_url: "https://huggingface.co/sentence-transformers/clip-ViT-L-14/raw/main/0_CLIPModel/tokenizer.json",
        context_length: 77,
        visual_size: 224,
    },
];

impl ClipModel {
    pub fn get_cache_dir(&self) -> PathBuf {
        // root is ~/.rehoboam/models
        // todo: this should be configurable, especially in docker
        let mut path = dirs::home_dir().unwrap();
        path.push(".rehoboam");
        path.push("models");
        path.push("clip");
        path.push(self.name.replace('/', "-"));
        path
    }
}
