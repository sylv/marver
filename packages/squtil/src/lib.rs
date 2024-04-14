use sqlite_loadable::prelude::*;
use sqlite_loadable::{api, define_scalar_function, Result};

pub mod core {
    use tonic::include_proto;
    include_proto!("me.sylver.marver.core");
}

use core::Embedding;
use prost::Message;

pub fn cosine_similarity(vec_a: &[u8], vec_b: &[u8]) -> Result<f32> {
    let embedding_a = Embedding::decode(vec_a).expect("could not decode vec_a");
    let embedding_b = Embedding::decode(vec_b).expect("could not decode vec_b");

    if embedding_a.value.is_empty() || embedding_b.value.is_empty() {
        return Ok(0.0);
    }

    if embedding_a.source != embedding_b.source {
        return Err(format!(
            "cannot compare embeddings from different models: {} and {}",
            embedding_a.source.unwrap_or("<unknown>".to_owned()),
            embedding_b.source.unwrap_or("<unknown>".to_owned())
        )
        .into());
    }

    if embedding_a.value.len() != embedding_b.value.len() {
        return Err(format!(
            "embeddings must be of equal length, got {} and {}",
            embedding_a.value.len(),
            embedding_b.value.len()
        )
        .into());
    }

    let mut dot_product = 0.0;
    let mut a_norm = 0.0;
    let mut b_norm = 0.0;
    for i in 0..embedding_a.value.len() {
        dot_product += embedding_a.value[i] * embedding_b.value[i];
        a_norm += embedding_a.value[i] * embedding_a.value[i];
        b_norm += embedding_b.value[i] * embedding_b.value[i];
    }

    Ok(dot_product / (a_norm.sqrt() * b_norm.sqrt()))
}

pub fn hamming_distance(hash_a: &[u8], hash_b: &[u8]) -> i64 {
    if hash_a.is_empty() || hash_b.is_empty() {
        return 0;
    }
    hash_a
        .iter()
        .zip(hash_b.iter())
        .fold(0, |acc, (&a, &b)| acc + (a ^ b).count_ones() as i64)
}

pub fn sql_cosine_similarity(
    ctx: *mut sqlite3_context,
    values: &[*mut sqlite3_value],
) -> Result<()> {
    let a = api::value_blob(values.get(0).expect("missing first argument"));
    let b = api::value_blob(values.get(1).expect("missing second argument"));
    let a = a.to_vec();
    let b = b.to_vec();
    let result = cosine_similarity(&a, &b)?;
    api::result_double(ctx, result as f64);
    Ok(())
}

pub fn sql_path_dirname(ctx: *mut sqlite3_context, values: &[*mut sqlite3_value]) -> Result<()> {
    let path = api::value_text(values.get(0).expect("missing first argument"))?;
    let path = std::path::Path::new(path);
    let result = path.parent().unwrap_or(path).to_str().unwrap_or("");
    api::result_text(ctx, result)?;
    Ok(())
}

pub fn sql_path_extension(ctx: *mut sqlite3_context, values: &[*mut sqlite3_value]) -> Result<()> {
    let path = api::value_text(values.get(0).expect("missing first argument"))?;
    let path = std::path::Path::new(path);
    let result = path.extension().unwrap_or_default().to_str().unwrap_or("");
    api::result_text(ctx, result)?;
    Ok(())
}

pub fn sql_path_basename(ctx: *mut sqlite3_context, values: &[*mut sqlite3_value]) -> Result<()> {
    let path = api::value_text(values.get(0).expect("missing first argument"))?;
    let path = std::path::Path::new(path);
    let result = path.file_stem().unwrap_or_default().to_str().unwrap_or("");
    api::result_text(ctx, result)?;
    Ok(())
}

pub fn sql_hamming_distance(
    ctx: *mut sqlite3_context,
    values: &[*mut sqlite3_value],
) -> Result<()> {
    let a = api::value_blob(values.get(0).expect("missing first argument"));
    let b = api::value_blob(values.get(1).expect("missing second argument"));
    let a = a.to_vec();
    let b = b.to_vec();
    let result = hamming_distance(&a, &b);
    api::result_int64(ctx, result);
    Ok(())
}

#[sqlite_entrypoint]
pub fn sqlite3_squtil_init(db: *mut sqlite3) -> Result<()> {
    let flags = FunctionFlags::UTF8 | FunctionFlags::DETERMINISTIC;
    define_scalar_function(db, "cosine_similarity", 2, sql_cosine_similarity, flags)?;
    define_scalar_function(db, "path_dirname", 1, sql_path_dirname, flags)?;
    define_scalar_function(db, "path_extension", 1, sql_path_extension, flags)?;
    define_scalar_function(db, "path_basename", 1, sql_path_basename, flags)?;
    define_scalar_function(db, "hamming_distance", 2, sql_hamming_distance, flags)?;
    Ok(())
}
