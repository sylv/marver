# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: solomon.proto
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\rsolomon.proto\x12\x18me.sylver.marver.solomon\"F\n\x10GetVectorRequest\x12\x13\n\tfile_path\x18\x04 \x01(\tH\x00\x12\x14\n\ntext_input\x18\x05 \x01(\tH\x00\x42\x07\n\x05input\"E\n\x11GetVectorResponse\x12\x30\n\x06vector\x18\x01 \x01(\x0b\x32 .me.sylver.marver.solomon.Vector\"\'\n\x12\x44\x65tectFacesRequest\x12\x11\n\tfile_path\x18\x01 \x01(\t\"D\n\x13\x44\x65tectFacesResponse\x12-\n\x05\x66\x61\x63\x65s\x18\x01 \x03(\x0b\x32\x1e.me.sylver.marver.solomon.Face\"\x89\x01\n\x04\x46\x61\x63\x65\x12;\n\x0c\x62ounding_box\x18\x01 \x01(\x0b\x32%.me.sylver.marver.solomon.BoundingBox\x12\x30\n\x06vector\x18\x02 \x01(\x0b\x32 .me.sylver.marver.solomon.Vector\x12\x12\n\nconfidence\x18\x03 \x01(\x02\"=\n\x0b\x42oundingBox\x12\n\n\x02x1\x18\x01 \x01(\x02\x12\n\n\x02y1\x18\x02 \x01(\x02\x12\n\n\x02x2\x18\x03 \x01(\x02\x12\n\n\x02y2\x18\x04 \x01(\x02\"\x17\n\x06Vector\x12\r\n\x05value\x18\x01 \x03(\x02\"\"\n\rGetOCRRequest\x12\x11\n\tfile_path\x18\x01 \x01(\t\"@\n\x0eGetOCRResponse\x12.\n\x07results\x18\x01 \x03(\x0b\x32\x1d.me.sylver.marver.solomon.OCR\"d\n\x03OCR\x12\x0c\n\x04text\x18\x01 \x01(\t\x12;\n\x0c\x62ounding_box\x18\x02 \x01(\x0b\x32%.me.sylver.marver.solomon.BoundingBox\x12\x12\n\nconfidence\x18\x03 \x01(\x02\x32\xc5\x02\n\x0eSolomonService\x12\x66\n\tGetVector\x12*.me.sylver.marver.solomon.GetVectorRequest\x1a+.me.sylver.marver.solomon.GetVectorResponse\"\x00\x12l\n\x0b\x44\x65tectFaces\x12,.me.sylver.marver.solomon.DetectFacesRequest\x1a-.me.sylver.marver.solomon.DetectFacesResponse\"\x00\x12]\n\x06GetOCR\x12\'.me.sylver.marver.solomon.GetOCRRequest\x1a(.me.sylver.marver.solomon.GetOCRResponse\"\x00\x62\x06proto3')



_GETVECTORREQUEST = DESCRIPTOR.message_types_by_name['GetVectorRequest']
_GETVECTORRESPONSE = DESCRIPTOR.message_types_by_name['GetVectorResponse']
_DETECTFACESREQUEST = DESCRIPTOR.message_types_by_name['DetectFacesRequest']
_DETECTFACESRESPONSE = DESCRIPTOR.message_types_by_name['DetectFacesResponse']
_FACE = DESCRIPTOR.message_types_by_name['Face']
_BOUNDINGBOX = DESCRIPTOR.message_types_by_name['BoundingBox']
_VECTOR = DESCRIPTOR.message_types_by_name['Vector']
_GETOCRREQUEST = DESCRIPTOR.message_types_by_name['GetOCRRequest']
_GETOCRRESPONSE = DESCRIPTOR.message_types_by_name['GetOCRResponse']
_OCR = DESCRIPTOR.message_types_by_name['OCR']
GetVectorRequest = _reflection.GeneratedProtocolMessageType('GetVectorRequest', (_message.Message,), {
  'DESCRIPTOR' : _GETVECTORREQUEST,
  '__module__' : 'solomon_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.solomon.GetVectorRequest)
  })
_sym_db.RegisterMessage(GetVectorRequest)

GetVectorResponse = _reflection.GeneratedProtocolMessageType('GetVectorResponse', (_message.Message,), {
  'DESCRIPTOR' : _GETVECTORRESPONSE,
  '__module__' : 'solomon_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.solomon.GetVectorResponse)
  })
_sym_db.RegisterMessage(GetVectorResponse)

DetectFacesRequest = _reflection.GeneratedProtocolMessageType('DetectFacesRequest', (_message.Message,), {
  'DESCRIPTOR' : _DETECTFACESREQUEST,
  '__module__' : 'solomon_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.solomon.DetectFacesRequest)
  })
_sym_db.RegisterMessage(DetectFacesRequest)

DetectFacesResponse = _reflection.GeneratedProtocolMessageType('DetectFacesResponse', (_message.Message,), {
  'DESCRIPTOR' : _DETECTFACESRESPONSE,
  '__module__' : 'solomon_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.solomon.DetectFacesResponse)
  })
_sym_db.RegisterMessage(DetectFacesResponse)

Face = _reflection.GeneratedProtocolMessageType('Face', (_message.Message,), {
  'DESCRIPTOR' : _FACE,
  '__module__' : 'solomon_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.solomon.Face)
  })
_sym_db.RegisterMessage(Face)

BoundingBox = _reflection.GeneratedProtocolMessageType('BoundingBox', (_message.Message,), {
  'DESCRIPTOR' : _BOUNDINGBOX,
  '__module__' : 'solomon_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.solomon.BoundingBox)
  })
_sym_db.RegisterMessage(BoundingBox)

Vector = _reflection.GeneratedProtocolMessageType('Vector', (_message.Message,), {
  'DESCRIPTOR' : _VECTOR,
  '__module__' : 'solomon_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.solomon.Vector)
  })
_sym_db.RegisterMessage(Vector)

GetOCRRequest = _reflection.GeneratedProtocolMessageType('GetOCRRequest', (_message.Message,), {
  'DESCRIPTOR' : _GETOCRREQUEST,
  '__module__' : 'solomon_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.solomon.GetOCRRequest)
  })
_sym_db.RegisterMessage(GetOCRRequest)

GetOCRResponse = _reflection.GeneratedProtocolMessageType('GetOCRResponse', (_message.Message,), {
  'DESCRIPTOR' : _GETOCRRESPONSE,
  '__module__' : 'solomon_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.solomon.GetOCRResponse)
  })
_sym_db.RegisterMessage(GetOCRResponse)

OCR = _reflection.GeneratedProtocolMessageType('OCR', (_message.Message,), {
  'DESCRIPTOR' : _OCR,
  '__module__' : 'solomon_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.solomon.OCR)
  })
_sym_db.RegisterMessage(OCR)

_SOLOMONSERVICE = DESCRIPTOR.services_by_name['SolomonService']
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _GETVECTORREQUEST._serialized_start=43
  _GETVECTORREQUEST._serialized_end=113
  _GETVECTORRESPONSE._serialized_start=115
  _GETVECTORRESPONSE._serialized_end=184
  _DETECTFACESREQUEST._serialized_start=186
  _DETECTFACESREQUEST._serialized_end=225
  _DETECTFACESRESPONSE._serialized_start=227
  _DETECTFACESRESPONSE._serialized_end=295
  _FACE._serialized_start=298
  _FACE._serialized_end=435
  _BOUNDINGBOX._serialized_start=437
  _BOUNDINGBOX._serialized_end=498
  _VECTOR._serialized_start=500
  _VECTOR._serialized_end=523
  _GETOCRREQUEST._serialized_start=525
  _GETOCRREQUEST._serialized_end=559
  _GETOCRRESPONSE._serialized_start=561
  _GETOCRRESPONSE._serialized_end=625
  _OCR._serialized_start=627
  _OCR._serialized_end=727
  _SOLOMONSERVICE._serialized_start=730
  _SOLOMONSERVICE._serialized_end=1055
# @@protoc_insertion_point(module_scope)
