use proto::rehoboam_service_server::RehoboamService;
use tonic::{Request, Response, Status};

use crate::clip::Clip;

use self::proto::{EncodeImageReply, EncodeImageRequest, EncodeTextReply, EncodeTextRequest};

mod core {
    use tonic::include_proto;
    include_proto!("me.sylver.marver.core");
}

pub mod proto {
    use tonic::include_proto;
    include_proto!("me.sylver.marver.rehoboam");
}

pub struct Service {
    clip: Clip,
}

impl Service {
    pub fn new(clip: Clip) -> Self {
        Self { clip }
    }
}

#[tonic::async_trait]
impl RehoboamService for Service {
    async fn encode_text(
        &self,
        request: Request<EncodeTextRequest>,
    ) -> Result<Response<EncodeTextReply>, Status> {
        let texts = request.into_inner().texts;
        let embeddings = self
            .clip
            .encode_text(&texts.iter().map(|t| t.as_str()).collect());

        return match embeddings {
            Err(e) => Err(Status::internal(e.to_string())),
            Ok(embeddings) => Ok(Response::new(EncodeTextReply {
                embeddings: embeddings
                    .into_iter()
                    .map(|value| core::Embedding { value })
                    .collect(),
            })),
        };
    }

    async fn encode_image(
        &self,
        request: Request<EncodeImageRequest>,
    ) -> Result<Response<EncodeImageReply>, Status> {
        let images = request.into_inner().images;
        let embeddings = self.clip.encode_image(&images);

        return match embeddings {
            Err(e) => Err(Status::internal(e.to_string())),
            Ok(embeddings) => Ok(Response::new(EncodeImageReply {
                embeddings: embeddings
                    .into_iter()
                    .map(|value| core::Embedding { value })
                    .collect(),
            })),
        };
    }
}
