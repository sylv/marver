use proto::rehoboam_service_server::RehoboamService;
use tonic::{Request, Response, Status};

use crate::{
    clip::Clip,
    facerec::{arcface::ArcFace, retinaface::RetinaFace},
    whisper::Whisper,
};

use self::{
    core::{BoundingBox, Embedding, Face, Landmark, Subtitle},
    proto::{
        EncodeImageReply, EncodeImageRequest, EncodeTextReply, EncodeTextRequest,
        ExtractFacesReply, ExtractFacesRequest, ExtractSubtitlesReply, ExtractSubtitlesRequest,
    },
};

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
    retinaface: RetinaFace,
    arcface: ArcFace,
    whisper: Whisper,
}

impl Service {
    pub fn new(clip: Clip, retinaface: RetinaFace, arcface: ArcFace, whisper: Whisper) -> Self {
        Self {
            clip,
            retinaface,
            arcface,
            whisper,
        }
    }
}

#[tonic::async_trait]
impl RehoboamService for Service {
    async fn extract_subtitles(
        &self,
        request: Request<ExtractSubtitlesRequest>,
    ) -> Result<Response<ExtractSubtitlesReply>, Status> {
        let audio = request.into_inner().audio;
        let subtitles = self.whisper.predict(audio);

        return match subtitles {
            Err(e) => Err(Status::internal(e.to_string())),
            Ok(subtitles) => Ok(Response::new(ExtractSubtitlesReply {
                subtitles: subtitles
                    .into_iter()
                    .map(|subtitle| Subtitle {
                        text: subtitle.text,
                        start: subtitle.start as i32,
                        end: subtitle.end as i32,
                    })
                    .collect(),
            })),
        };
    }

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
                    .map(|value| Embedding { value })
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
                    .map(|value| Embedding { value })
                    .collect(),
            })),
        };
    }

    async fn extract_faces(
        &self,
        request: Request<ExtractFacesRequest>,
    ) -> Result<Response<ExtractFacesReply>, Status> {
        let images = request.into_inner().images;
        if images.len() > 1 {
            return Err(Status::invalid_argument(
                "Multiple images are not yet supported",
            ));
        }

        let image = &images[0];
        let faces = self
            .retinaface
            .predict(image)
            .map_err(|e| Status::internal(e.to_string()))?;

        let embeddings = self
            .arcface
            .predict(image, faces)
            .map_err(|e| Status::internal(e.to_string()))?;

        let response = ExtractFacesReply {
            faces: embeddings
                .into_iter()
                .map(|(face, embedding)| {
                    let embedding = Embedding { value: embedding };
                    // bounding box is in percentages, we convert back to pixels
                    let bbox = face.bbox;
                    let bbox = BoundingBox {
                        x1: (bbox.x1),
                        y1: (bbox.y1),
                        x2: (bbox.x2),
                        y2: (bbox.y2),
                    };

                    let landmarks = vec![
                        Landmark {
                            name: "left_eye".to_string(),
                            x: face.landmarks[0][0],
                            y: face.landmarks[0][1],
                        },
                        Landmark {
                            name: "right_eye".to_string(),
                            x: face.landmarks[1][0],
                            y: face.landmarks[1][1],
                        },
                        Landmark {
                            name: "nose".to_string(),
                            x: face.landmarks[2][0],
                            y: face.landmarks[2][1],
                        },
                        Landmark {
                            name: "mouth_left".to_string(),
                            x: face.landmarks[3][0],
                            y: face.landmarks[3][1],
                        },
                        Landmark {
                            name: "mouth_right".to_string(),
                            x: face.landmarks[4][0],
                            y: face.landmarks[4][1],
                        },
                    ];

                    Face {
                        confidence: face.score,
                        embedding: Some(embedding),
                        bounding_box: Some(bbox),
                        landmarks,
                    }
                })
                .collect(),
        };

        Ok(Response::new(response))
    }
}
