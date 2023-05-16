from concurrent import futures
from functools import cached_property

import clip
import grpc
import sentry_pb2
import sentry_pb2_grpc
import torch
from PIL import Image

clip_model_name = "ViT-L/14"
device = "cuda" if torch.cuda.is_available() else "cpu"


class SentryService(sentry_pb2_grpc.SentryServiceServicer):
    @cached_property
    def clip_model(self):
        print("Loading clip model using device:", device)
        model, preprocess = clip.load(clip_model_name, device=device)
        print("Clip model loaded")
        return model, preprocess, device

    def GetVector(self, request, context):
        # Load the image and generate the vector
        model, preprocess, device = self.clip_model

        if request.file_path:
            image_path = request.file_path
            image = preprocess(Image.open(image_path)).unsqueeze(0)
            image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
            with torch.no_grad():
                image_features = model.encode_image(image)
                image_features /= image_features.norm(dim=-1, keepdim=True)

            vector = image_features.flatten().tolist()

            return sentry_pb2.GetVectorResponse(vector={
                "value": vector,
            })
        else:
            text_input = request.text_input
            text = clip.tokenize([text_input]).to(device)
            with torch.no_grad():
                text_features = model.encode_text(text)
                text_features /= text_features.norm(dim=-1, keepdim=True)

            vector = text_features.flatten().tolist()

            return sentry_pb2.GetVectorResponse(vector={
                "value": vector,
            })


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    sentry_pb2_grpc.add_SentryServiceServicer_to_server(
        SentryService(), server)
    server.add_insecure_port("[::]:50051")
    server.add_insecure_port("0.0.0.0:50051")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
