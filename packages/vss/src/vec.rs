pub fn vec_to_blob(embedding: &[f32]) -> Vec<u8> {
    let min = embedding.iter().cloned().fold(f32::INFINITY, f32::min);
    let max = embedding.iter().cloned().fold(f32::NEG_INFINITY, f32::max);
    let scale = 255.0 / (max - min);

    // 1 byte per embed element + 8 bytes for min/max
    let mut blob = Vec::with_capacity(embedding.len() + 8);

    blob.extend_from_slice(&min.to_le_bytes());
    blob.extend_from_slice(&max.to_le_bytes());

    // Quantize each value
    for &value in embedding {
        let scaled = ((value - min) * scale).round();
        blob.push(scaled as u8);
    }

    blob
}

pub fn vec_from_blob(blob: &[u8]) -> Vec<f32> {
    // Extract min and max from the first 8 bytes
    let min = f32::from_le_bytes(blob[0..4].try_into().unwrap());
    let max = f32::from_le_bytes(blob[4..8].try_into().unwrap());
    let scale = 255.0 / (max - min);

    // Dequantize the rest of the data
    blob[8..]
        .iter()
        .map(|&quantized| (quantized as f32 / scale) + min)
        .collect()
}
