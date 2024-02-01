use clip::Clip;
use facerec::arcface::ArcFace;
use facerec::download_models;
use facerec::retinaface::RetinaFace;
use ort::{Environment, ExecutionProvider};
use service::proto::rehoboam_service_server::RehoboamServiceServer;
use service::Service;
use tonic::transport::Server;
use whisper::Whisper;

mod clip;
mod facerec;
mod service;
mod util;
mod whisper;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let environment = Environment::builder()
        .with_name("rehoboam")
        .with_execution_providers([ExecutionProvider::CPU(Default::default())])
        .build()?
        .into_arc();

    let (det_model, rec_model) = download_models().await?;
    let retinaface = RetinaFace::init(environment.clone(), det_model).await?;
    let arcface = ArcFace::init(environment.clone(), rec_model).await?;

    let clip = Clip::init(environment).await.expect("Failed to load CLIP");

    let whisper = Whisper::init().await.expect("Failed to load Whisper");

    let server = Service::new(clip, retinaface, arcface, whisper);

    println!("Starting server");

    Server::builder()
        .add_service(RehoboamServiceServer::new(server))
        .serve("0.0.0.0:50033".parse()?)
        .await?;

    Ok(())
}
