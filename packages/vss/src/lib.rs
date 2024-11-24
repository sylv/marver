use sqlite_loadable::prelude::*;
use sqlite_loadable::{api, define_scalar_function, Result};
use vec::{vec_from_blob, vec_to_blob};

mod vec;

pub fn cosine_similarity(vec_a: &[u8], vec_b: &[u8]) -> Result<f32> {
    let embedding_a = vec_from_blob(vec_a);
    let embedding_b = vec_from_blob(vec_b);

    if embedding_a.is_empty() || embedding_b.is_empty() {
        return Err("empty embeddings".into());
    }

    if embedding_a.len() != embedding_b.len() {
        return Err(format!(
            "embeddings must be of equal length, got {} and {}",
            embedding_a.len(),
            embedding_b.len()
        )
        .into());
    }

    let mut dot_product = 0.0;
    let mut a_norm = 0.0;
    let mut b_norm = 0.0;
    for i in 0..embedding_a.len() {
        dot_product += embedding_a[i] * embedding_b[i];
        a_norm += embedding_a[i] * embedding_a[i];
        b_norm += embedding_b[i] * embedding_b[i];
    }

    Ok(dot_product / (a_norm.sqrt() * b_norm.sqrt()))
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

pub fn sql_vec_to_blob(ctx: *mut sqlite3_context, values: &[*mut sqlite3_value]) -> Result<()> {
    let json =
        api::value_text(values.get(0).expect("missing first argument")).expect("invalid string");
    let embedding: Vec<f32> = serde_json::from_str(&json).expect("invalid JSON");
    let blob = vec_to_blob(&embedding);
    api::result_blob(ctx, &blob);
    Ok(())
}

pub fn sql_vec_from_blob(ctx: *mut sqlite3_context, values: &[*mut sqlite3_value]) -> Result<()> {
    let blob = api::value_blob(values.get(0).expect("missing first argument"));
    let embedding = vec_from_blob(blob);
    let json = serde_json::to_string(&embedding).expect("invalid JSON");
    api::result_text(ctx, &json)?;
    Ok(())
}

#[sqlite_entrypoint]
pub fn sqlite3_vss_init(db: *mut sqlite3) -> Result<()> {
    let flags = FunctionFlags::UTF8 | FunctionFlags::DETERMINISTIC;
    define_scalar_function(db, "cosine_similarity", 2, sql_cosine_similarity, flags)?;
    define_scalar_function(db, "vec_to_blob", 1, sql_vec_to_blob, flags)?;
    define_scalar_function(db, "vec_from_blob", 1, sql_vec_from_blob, flags)?;
    Ok(())
}
