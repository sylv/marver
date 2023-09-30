# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: solomon.proto
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\rsolomon.proto\x12\x18me.sylver.marver.solomon\"Q\n\x16MergeEmbeddingsRequest\x12\x37\n\nembeddings\x18\x01 \x03(\x0b\x32#.me.sylver.marver.solomon.Embedding\"Q\n\x17MergeEmbeddingsResponse\x12\x36\n\tembedding\x18\x01 \x01(\x0b\x32#.me.sylver.marver.solomon.Embedding\"N\n\x18GetImageEmbeddingRequest\x12\x13\n\tfile_path\x18\x04 \x01(\tH\x00\x12\x14\n\ntext_input\x18\x05 \x01(\tH\x00\x42\x07\n\x05input\"S\n\x19GetImageEmbeddingResponse\x12\x36\n\tembedding\x18\x01 \x01(\x0b\x32#.me.sylver.marver.solomon.Embedding\"\'\n\x12\x44\x65tectFacesRequest\x12\x11\n\tfile_path\x18\x01 \x01(\t\"D\n\x13\x44\x65tectFacesResponse\x12-\n\x05\x66\x61\x63\x65s\x18\x01 \x03(\x0b\x32\x1e.me.sylver.marver.solomon.Face\"\x8f\x01\n\x04\x46\x61\x63\x65\x12;\n\x0c\x62ounding_box\x18\x01 \x01(\x0b\x32%.me.sylver.marver.solomon.BoundingBox\x12\x36\n\tembedding\x18\x02 \x01(\x0b\x32#.me.sylver.marver.solomon.Embedding\x12\x12\n\nconfidence\x18\x03 \x01(\x02\"=\n\x0b\x42oundingBox\x12\n\n\x02x1\x18\x01 \x01(\x02\x12\n\n\x02y1\x18\x02 \x01(\x02\x12\n\n\x02x2\x18\x03 \x01(\x02\x12\n\n\x02y2\x18\x04 \x01(\x02\"\x1a\n\tEmbedding\x12\r\n\x05value\x18\x01 \x03(\x02\"\"\n\rGetOCRRequest\x12\x11\n\tfile_path\x18\x01 \x01(\t\"@\n\x0eGetOCRResponse\x12.\n\x07results\x18\x01 \x03(\x0b\x32\x1d.me.sylver.marver.solomon.OCR\"d\n\x03OCR\x12\x0c\n\x04text\x18\x01 \x01(\t\x12;\n\x0c\x62ounding_box\x18\x02 \x01(\x0b\x32%.me.sylver.marver.solomon.BoundingBox\x12\x12\n\nconfidence\x18\x03 \x01(\x02\x32\xd7\x03\n\x0eSolomonService\x12~\n\x11GetImageEmbedding\x12\x32.me.sylver.marver.solomon.GetImageEmbeddingRequest\x1a\x33.me.sylver.marver.solomon.GetImageEmbeddingResponse\"\x00\x12l\n\x0b\x44\x65tectFaces\x12,.me.sylver.marver.solomon.DetectFacesRequest\x1a-.me.sylver.marver.solomon.DetectFacesResponse\"\x00\x12]\n\x06GetOCR\x12\'.me.sylver.marver.solomon.GetOCRRequest\x1a(.me.sylver.marver.solomon.GetOCRResponse\"\x00\x12x\n\x0fMergeEmbeddings\x12\x30.me.sylver.marver.solomon.MergeEmbeddingsRequest\x1a\x31.me.sylver.marver.solomon.MergeEmbeddingsResponse\"\x00\x62\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'solomon_pb2', _globals)
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _globals['_MERGEEMBEDDINGSREQUEST']._serialized_start=43
  _globals['_MERGEEMBEDDINGSREQUEST']._serialized_end=124
  _globals['_MERGEEMBEDDINGSRESPONSE']._serialized_start=126
  _globals['_MERGEEMBEDDINGSRESPONSE']._serialized_end=207
  _globals['_GETIMAGEEMBEDDINGREQUEST']._serialized_start=209
  _globals['_GETIMAGEEMBEDDINGREQUEST']._serialized_end=287
  _globals['_GETIMAGEEMBEDDINGRESPONSE']._serialized_start=289
  _globals['_GETIMAGEEMBEDDINGRESPONSE']._serialized_end=372
  _globals['_DETECTFACESREQUEST']._serialized_start=374
  _globals['_DETECTFACESREQUEST']._serialized_end=413
  _globals['_DETECTFACESRESPONSE']._serialized_start=415
  _globals['_DETECTFACESRESPONSE']._serialized_end=483
  _globals['_FACE']._serialized_start=486
  _globals['_FACE']._serialized_end=629
  _globals['_BOUNDINGBOX']._serialized_start=631
  _globals['_BOUNDINGBOX']._serialized_end=692
  _globals['_EMBEDDING']._serialized_start=694
  _globals['_EMBEDDING']._serialized_end=720
  _globals['_GETOCRREQUEST']._serialized_start=722
  _globals['_GETOCRREQUEST']._serialized_end=756
  _globals['_GETOCRRESPONSE']._serialized_start=758
  _globals['_GETOCRRESPONSE']._serialized_end=822
  _globals['_OCR']._serialized_start=824
  _globals['_OCR']._serialized_end=924
  _globals['_SOLOMONSERVICE']._serialized_start=927
  _globals['_SOLOMONSERVICE']._serialized_end=1398
# @@protoc_insertion_point(module_scope)
