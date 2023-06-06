# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: sentry.proto
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x0csentry.proto\x12\x17me.sylver.marver.sentry\"F\n\x10GetVectorRequest\x12\x13\n\tfile_path\x18\x04 \x01(\tH\x00\x12\x14\n\ntext_input\x18\x05 \x01(\tH\x00\x42\x07\n\x05input\"D\n\x11GetVectorResponse\x12/\n\x06vector\x18\x01 \x01(\x0b\x32\x1f.me.sylver.marver.sentry.Vector\"\'\n\x12\x44\x65tectFacesRequest\x12\x11\n\tfile_path\x18\x01 \x01(\t\"C\n\x13\x44\x65tectFacesResponse\x12,\n\x05\x66\x61\x63\x65s\x18\x01 \x03(\x0b\x32\x1d.me.sylver.marver.sentry.Face\"\x87\x01\n\x04\x46\x61\x63\x65\x12:\n\x0c\x62ounding_box\x18\x01 \x01(\x0b\x32$.me.sylver.marver.sentry.BoundingBox\x12/\n\x06vector\x18\x02 \x01(\x0b\x32\x1f.me.sylver.marver.sentry.Vector\x12\x12\n\nconfidence\x18\x03 \x01(\x02\"=\n\x0b\x42oundingBox\x12\n\n\x02x1\x18\x01 \x01(\x02\x12\n\n\x02y1\x18\x02 \x01(\x02\x12\n\n\x02x2\x18\x03 \x01(\x02\x12\n\n\x02y2\x18\x04 \x01(\x02\"\x17\n\x06Vector\x12\r\n\x05value\x18\x01 \x03(\x02\x32\xe1\x01\n\rSentryService\x12\x64\n\tGetVector\x12).me.sylver.marver.sentry.GetVectorRequest\x1a*.me.sylver.marver.sentry.GetVectorResponse\"\x00\x12j\n\x0b\x44\x65tectFaces\x12+.me.sylver.marver.sentry.DetectFacesRequest\x1a,.me.sylver.marver.sentry.DetectFacesResponse\"\x00\x62\x06proto3')



_GETVECTORREQUEST = DESCRIPTOR.message_types_by_name['GetVectorRequest']
_GETVECTORRESPONSE = DESCRIPTOR.message_types_by_name['GetVectorResponse']
_DETECTFACESREQUEST = DESCRIPTOR.message_types_by_name['DetectFacesRequest']
_DETECTFACESRESPONSE = DESCRIPTOR.message_types_by_name['DetectFacesResponse']
_FACE = DESCRIPTOR.message_types_by_name['Face']
_BOUNDINGBOX = DESCRIPTOR.message_types_by_name['BoundingBox']
_VECTOR = DESCRIPTOR.message_types_by_name['Vector']
GetVectorRequest = _reflection.GeneratedProtocolMessageType('GetVectorRequest', (_message.Message,), {
  'DESCRIPTOR' : _GETVECTORREQUEST,
  '__module__' : 'sentry_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.sentry.GetVectorRequest)
  })
_sym_db.RegisterMessage(GetVectorRequest)

GetVectorResponse = _reflection.GeneratedProtocolMessageType('GetVectorResponse', (_message.Message,), {
  'DESCRIPTOR' : _GETVECTORRESPONSE,
  '__module__' : 'sentry_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.sentry.GetVectorResponse)
  })
_sym_db.RegisterMessage(GetVectorResponse)

DetectFacesRequest = _reflection.GeneratedProtocolMessageType('DetectFacesRequest', (_message.Message,), {
  'DESCRIPTOR' : _DETECTFACESREQUEST,
  '__module__' : 'sentry_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.sentry.DetectFacesRequest)
  })
_sym_db.RegisterMessage(DetectFacesRequest)

DetectFacesResponse = _reflection.GeneratedProtocolMessageType('DetectFacesResponse', (_message.Message,), {
  'DESCRIPTOR' : _DETECTFACESRESPONSE,
  '__module__' : 'sentry_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.sentry.DetectFacesResponse)
  })
_sym_db.RegisterMessage(DetectFacesResponse)

Face = _reflection.GeneratedProtocolMessageType('Face', (_message.Message,), {
  'DESCRIPTOR' : _FACE,
  '__module__' : 'sentry_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.sentry.Face)
  })
_sym_db.RegisterMessage(Face)

BoundingBox = _reflection.GeneratedProtocolMessageType('BoundingBox', (_message.Message,), {
  'DESCRIPTOR' : _BOUNDINGBOX,
  '__module__' : 'sentry_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.sentry.BoundingBox)
  })
_sym_db.RegisterMessage(BoundingBox)

Vector = _reflection.GeneratedProtocolMessageType('Vector', (_message.Message,), {
  'DESCRIPTOR' : _VECTOR,
  '__module__' : 'sentry_pb2'
  # @@protoc_insertion_point(class_scope:me.sylver.marver.sentry.Vector)
  })
_sym_db.RegisterMessage(Vector)

_SENTRYSERVICE = DESCRIPTOR.services_by_name['SentryService']
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _GETVECTORREQUEST._serialized_start=41
  _GETVECTORREQUEST._serialized_end=111
  _GETVECTORRESPONSE._serialized_start=113
  _GETVECTORRESPONSE._serialized_end=181
  _DETECTFACESREQUEST._serialized_start=183
  _DETECTFACESREQUEST._serialized_end=222
  _DETECTFACESRESPONSE._serialized_start=224
  _DETECTFACESRESPONSE._serialized_end=291
  _FACE._serialized_start=294
  _FACE._serialized_end=429
  _BOUNDINGBOX._serialized_start=431
  _BOUNDINGBOX._serialized_end=492
  _VECTOR._serialized_start=494
  _VECTOR._serialized_end=517
  _SENTRYSERVICE._serialized_start=520
  _SENTRYSERVICE._serialized_end=745
# @@protoc_insertion_point(module_scope)
