from concurrent import futures
from functools import cached_property
import os
import cv2

import json
import clip
import grpc
import sentry_pb2
import sentry_pb2_grpc
import torch
from PIL import Image

fr_model_name = os.getenv(
    'MARVER_MACHINE_LEARNING_FACIAL_RECOGNITION_MODEL', 'buffalo_l')
clip_model_name = os.getenv("MARVER_MACHINE_LEARNING_CLIP_MODEL", "ViT-L/14")
device = os.getenv("MARVER_MACHINE_LEARNING_DEVICE",
                   "cuda" if torch.cuda.is_available() else "cpu")


class SentryService(sentry_pb2_grpc.SentryServiceServicer):
    @cached_property
    def clip_model(self):
        print("Loading clip model using device:", device)
        model, preprocess = clip.load(clip_model_name, device=device)
        print("Clip model loaded")
        return model, preprocess, device

    @cached_property
    def face_model(self):
        from insightface.app import FaceAnalysis

        model = FaceAnalysis(
            name=fr_model_name,
            allowed_modules=["detection", "recognition"],
            providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
        )

        model.prepare(ctx_id=0, det_size=(640, 640))
        return model

    @cached_property
    def ocr_model(self):
        from doctr.models import ocr_predictor
        from doctr.io import DocumentFile

        print("Loading OCR model")
        model = ocr_predictor(det_arch='db_resnet50',
                              reco_arch='crnn_vgg16_bn', pretrained=True)
        print("OCR model loaded")

        return model, DocumentFile

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

    def DetectFaces(self, request, context):
        image_path = request.file_path
        image = cv2.imread(image_path)
        if image is None:
            raise Exception("Image not found")

        faces = self.face_model.get(image)
        filtered = []
        for face in faces:
            filtered.append({
                "confidence": face.det_score,
                "bounding_box": {
                    "x1": round(face.bbox[0]),
                    "y1": round(face.bbox[1]),
                    "x2": round(face.bbox[2]),
                    "y2": round(face.bbox[3]),
                },
                "vector": {
                    "value": face.normed_embedding.tolist(),
                },
            })

        return sentry_pb2.DetectFacesResponse(faces=filtered)

    def GetOCR(self, request, context):
        model, DocumentFile = self.ocr_model

        image_path = request.file_path
        doc = DocumentFile.from_images(image_path)

        ocr_result = model(doc)
        output = ocr_result.export()

        clean_results = []
        page = output['pages'][0]
        page_width = page["dimensions"][0]
        page_height = page["dimensions"][1]
        for block in page["blocks"]:
            for line in block["lines"]:
                for word in line["words"]:
                    if word['confidence'] < 0.2:
                        continue

                    # geometry is in percentages, 0-1
                    # we need to convert to pixels
                    geometry = word["geometry"]
                    clean_results.append({
                        "text": word["value"],
                        "confidence": word["confidence"],
                        "bounding_box": {
                            "x1": round(geometry[0][0] * page_width),
                            "y1": round(geometry[0][1] * page_height),
                            "x2": round(geometry[1][0] * page_width),
                            "y2": round(geometry[1][1] * page_height),
                        }
                    })

        return sentry_pb2.GetOCRResponse(results=clean_results)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    sentry_pb2_grpc.add_SentryServiceServicer_to_server(
        SentryService(), server)
    server.add_insecure_port("[::]:50051")
    server.add_insecure_port("0.0.0.0:50051")
    server.start()
    print("Sentry server started")
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
