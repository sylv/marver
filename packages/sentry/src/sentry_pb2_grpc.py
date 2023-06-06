# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
"""Client and server classes corresponding to protobuf-defined services."""
import grpc

import sentry_pb2 as sentry__pb2


class SentryServiceStub(object):
    """Missing associated documentation comment in .proto file."""

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.GetVector = channel.unary_unary(
                '/me.sylver.marver.sentry.SentryService/GetVector',
                request_serializer=sentry__pb2.GetVectorRequest.SerializeToString,
                response_deserializer=sentry__pb2.GetVectorResponse.FromString,
                )
        self.DetectFaces = channel.unary_unary(
                '/me.sylver.marver.sentry.SentryService/DetectFaces',
                request_serializer=sentry__pb2.DetectFacesRequest.SerializeToString,
                response_deserializer=sentry__pb2.DetectFacesResponse.FromString,
                )


class SentryServiceServicer(object):
    """Missing associated documentation comment in .proto file."""

    def GetVector(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def DetectFaces(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_SentryServiceServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'GetVector': grpc.unary_unary_rpc_method_handler(
                    servicer.GetVector,
                    request_deserializer=sentry__pb2.GetVectorRequest.FromString,
                    response_serializer=sentry__pb2.GetVectorResponse.SerializeToString,
            ),
            'DetectFaces': grpc.unary_unary_rpc_method_handler(
                    servicer.DetectFaces,
                    request_deserializer=sentry__pb2.DetectFacesRequest.FromString,
                    response_serializer=sentry__pb2.DetectFacesResponse.SerializeToString,
            ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
            'me.sylver.marver.sentry.SentryService', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))


 # This class is part of an EXPERIMENTAL API.
class SentryService(object):
    """Missing associated documentation comment in .proto file."""

    @staticmethod
    def GetVector(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(request, target, '/me.sylver.marver.sentry.SentryService/GetVector',
            sentry__pb2.GetVectorRequest.SerializeToString,
            sentry__pb2.GetVectorResponse.FromString,
            options, channel_credentials,
            insecure, call_credentials, compression, wait_for_ready, timeout, metadata)

    @staticmethod
    def DetectFaces(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(request, target, '/me.sylver.marver.sentry.SentryService/DetectFaces',
            sentry__pb2.DetectFacesRequest.SerializeToString,
            sentry__pb2.DetectFacesResponse.FromString,
            options, channel_credentials,
            insecure, call_credentials, compression, wait_for_ready, timeout, metadata)
