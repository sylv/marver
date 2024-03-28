use std::io::Result;

fn main() -> Result<()> {
    let mut config = prost_build::Config::new();
    config.protoc_arg("--experimental_allow_proto3_optional");
    config.compile_protos(&["../../proto/core.proto"], &["../../proto"])?;
    Ok(())
}
