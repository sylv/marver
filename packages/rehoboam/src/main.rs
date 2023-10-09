use crate::clip::Clip;
use ort::{Environment, ExecutionProvider};
use service::{proto::rehoboam_service_server::RehoboamServiceServer, Service};
use tonic::transport::Server;

mod clip;
mod download;
mod service;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let is_cuda = ExecutionProvider::CUDA(Default::default()).is_available();
    if !is_cuda {
        println!("CUDA is not available");
    }

    let environment = Environment::builder()
        .with_name("clip")
        .with_execution_providers([ExecutionProvider::CPU(Default::default())])
        .build()?
        .into_arc();

    let clip = Clip::init(environment).await.expect("Failed to load CLIP");
    let server = Service::new(clip);

    Server::builder()
        .add_service(RehoboamServiceServer::new(server))
        .serve("0.0.0.0:50033".parse()?)
        .await?;

    Ok(())
}
