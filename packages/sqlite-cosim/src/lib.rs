use sqlite_loadable::prelude::*;
use sqlite_loadable::{api, define_scalar_function, Result};

pub fn cosine_similarity(vec_a: &[u8], vec_b: &[u8]) -> Result<f32> {
    let embedding_a: Vec<f32> = rmp_serde::from_slice(vec_a).expect("could not decode vec_a");
    let embedding_b: Vec<f32> = rmp_serde::from_slice(vec_b).expect("could not decode vec_b");

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

#[sqlite_entrypoint]
pub fn sqlite3_sqlitecosim_init(db: *mut sqlite3) -> Result<()> {
    let flags = FunctionFlags::UTF8 | FunctionFlags::DETERMINISTIC;
    define_scalar_function(db, "cosine_similarity", 2, sql_cosine_similarity, flags)?;
    Ok(())
}
