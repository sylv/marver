use std::io::Result;

fn main() -> Result<()> {
    prost_build::compile_protos(&["../sentry/src/sentry.proto"], &["../sentry/src"])?;
    Ok(())
}
