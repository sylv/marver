use anyhow::Result;
use lazy_static::lazy_static;
use ndarray::Array2;
use ort::{inputs, session::Session};
use tokenizers::{PaddingParams, Tokenizer, TruncationParams};

// https://huggingface.co/Xenova/siglip-base-patch16-224/blob/main/tokenizer_config.json
static MODEL_MAX_LENGTH: usize = 64;

lazy_static! {
    static ref TOKENIZER: Tokenizer = {
        let mut tokenizer =
            Tokenizer::from_pretrained("Xenova/siglip-base-patch16-224", None).unwrap();

        tokenizer
            .with_truncation(Some(TruncationParams {
                max_length: MODEL_MAX_LENGTH,
                ..Default::default()
            }))
            .unwrap()
            .with_padding(Some(PaddingParams {
                pad_token: "</s>".to_string(),
                ..Default::default()
            }));

        tokenizer
    };
    static ref EOS_TOKEN: i64 = TOKENIZER.token_to_id("</s>").unwrap() as i64;
    static ref PAD_TOKEN: i64 = TOKENIZER.token_to_id("</s>").unwrap() as i64;
}

// model input is int64[batch_size,sequence_length]
// model output is float32[batch_size,sequence_length,768]
pub fn run_text_model(session: &Session, texts: Vec<String>) -> Result<Vec<Vec<f32>>> {
    let mut encoded = vec![];
    for text in texts {
        let query = TOKENIZER.encode(text, false).unwrap();

        let mut input_ids = Vec::new();
        input_ids.extend(query.get_ids().iter().map(|v| *v as i64));
        input_ids.push(*EOS_TOKEN);
        input_ids.resize(64, *PAD_TOKEN);

        encoded.push(input_ids);
    }

    let ids = Array2::from_shape_vec((encoded.len(), MODEL_MAX_LENGTH), encoded.concat())?;

    let outputs = session.run(inputs![ids]?)?;
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
