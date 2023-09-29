use sqlite_loadable::prelude::*;
use sqlite_loadable::{api, define_scalar_function, Result};

pub mod solomon {
    include!(concat!(env!("OUT_DIR"), "/me.sylver.marver.solomon.rs"));
}

use prost::Message;
use solomon::Embedding;

pub fn cosine_similarity(vec_a: &[u8], vec_b: &[u8]) -> f64 {
    if vec_a.is_empty() || vec_b.is_empty() {
        return 0.0;
    }

    // hash_a and hash_b are Vectors which we have to decode
    let vec_a = Embedding::decode(vec_a).unwrap();
    let vec_b = Embedding::decode(vec_b).unwrap();

    let dot = vec_a
        .value
        .iter()
        .zip(vec_b.value.iter())
        .fold(0.0, |acc, (&a, &b)| acc + (a as f64) * (b as f64));
    let mag_a = vec_a
        .value
        .iter()
        .map(|&x| x as f64 * x as f64)
        .sum::<f64>()
        .sqrt();
    let mag_b = vec_b
        .value
        .iter()
        .map(|&x| x as f64 * x as f64)
        .sum::<f64>()
        .sqrt();

    dot / (mag_a * mag_b)
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
    let result = cosine_similarity(&a, &b);
    api::result_double(ctx, result);
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
