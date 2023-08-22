use std::io::Result;

fn main() -> Result<()> {
    prost_build::compile_protos(&["../solomon/src/solomon.proto"], &["../solomon/src"])?;
    Ok(())
}
