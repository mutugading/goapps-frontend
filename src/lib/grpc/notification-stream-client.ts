// Server-streaming gRPC client specifically for NotificationService.StreamNotifications.
// The generic service-client wraps everything as unary Promise; streaming is rare
// enough that a single dedicated helper is clearer than generalising the wrapper.

import * as grpc from "@grpc/grpc-js"
import {
  NotificationServiceDefinition,
  StreamNotificationsRequest,
  StreamNotificationsResponse,
} from "@/types/generated/iam/v1/notification"

const SERVICE_ADDRESS = `${process.env.IAM_GRPC_HOST || "localhost"}:${process.env.IAM_GRPC_PORT || "50052"}`

const CHANNEL_OPTIONS = {
  "grpc.keepalive_time_ms": 60000,
  "grpc.keepalive_timeout_ms": 20000,
  "grpc.keepalive_permit_without_calls": 1,
}

interface RawStreamingClient {
  streamNotifications: (
    request: StreamNotificationsRequest,
    metadata: grpc.Metadata,
    options?: grpc.CallOptions,
  ) => grpc.ClientReadableStream<StreamNotificationsResponse>
  close: () => void
}

let cachedClient: RawStreamingClient | null = null

function buildClient(): RawStreamingClient {
  const method = NotificationServiceDefinition.methods.streamNotifications
  const grpcServiceDef: Record<string, grpc.MethodDefinition<unknown, unknown>> = {
    streamNotifications: {
      path: `/${NotificationServiceDefinition.fullName}/${method.name}`,
      requestStream: method.requestStream,
      responseStream: method.responseStream,
      requestSerialize: (value: unknown) =>
        Buffer.from(method.requestType.encode(value as StreamNotificationsRequest).finish()),
      requestDeserialize: (buffer: Buffer) =>
        method.requestType.decode(new Uint8Array(buffer)),
      responseSerialize: (value: unknown) =>
        Buffer.from(method.responseType.encode(value as StreamNotificationsResponse).finish()),
      responseDeserialize: (buffer: Buffer) =>
        method.responseType.decode(new Uint8Array(buffer)),
    },
  }
  const ClientCtor = grpc.makeClientConstructor(grpcServiceDef, NotificationServiceDefinition.name)
  const c = new ClientCtor(SERVICE_ADDRESS, grpc.credentials.createInsecure(), CHANNEL_OPTIONS) as unknown as RawStreamingClient
  return c
}

// getNotificationStreamingClient returns a singleton client capable of opening
// server-streaming subscriptions to NotificationService.StreamNotifications.
// The client is reused across requests; gRPC handles connection lifecycle.
export function getNotificationStreamingClient(): RawStreamingClient {
  if (!cachedClient) {
    cachedClient = buildClient()
  }
  return cachedClient
}
