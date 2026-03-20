// Generic service client adapter for ts-proto generic-definitions → @grpc/grpc-js
// Converts ts-proto ServiceDefinition into promisified gRPC client methods

import * as grpc from "@grpc/grpc-js"

interface MessageFns<T> {
  encode(message: T, writer?: unknown): { finish(): Uint8Array }
  decode(input: Uint8Array, length?: number): T
}

interface MethodDefinition {
  name: string
  requestType: MessageFns<unknown>
  requestStream: boolean
  responseType: MessageFns<unknown>
  responseStream: boolean
  options: unknown
}

interface ServiceDef {
  name: string
  fullName: string
  methods: Record<string, MethodDefinition>
}

type ServiceClient<T extends ServiceDef> = {
  [K in keyof T["methods"]]: T["methods"][K] extends {
    requestType: MessageFns<infer Req>
    responseType: MessageFns<infer Res>
  }
    ? (request: Req, metadata?: grpc.Metadata, options?: grpc.CallOptions) => Promise<Res>
    : never
}

export function createServiceClient<T extends ServiceDef>(
  definition: T,
  address: string,
  credentials: grpc.ChannelCredentials,
  channelOptions?: Record<string, unknown>
): ServiceClient<T> {
  // Build grpc.ServiceDefinition from ts-proto generic-definitions
  const grpcServiceDef: Record<string, grpc.MethodDefinition<unknown, unknown>> = {}

  for (const [methodKey, method] of Object.entries(definition.methods)) {
    const path = `/${definition.fullName}/${method.name}`
    grpcServiceDef[methodKey] = {
      path,
      requestStream: method.requestStream,
      responseStream: method.responseStream,
      requestSerialize: (value: unknown) => {
        const writer = method.requestType.encode(value)
        return Buffer.from(writer.finish())
      },
      requestDeserialize: (buffer: Buffer) => {
        return method.requestType.decode(new Uint8Array(buffer))
      },
      responseSerialize: (value: unknown) => {
        const writer = method.responseType.encode(value)
        return Buffer.from(writer.finish())
      },
      responseDeserialize: (buffer: Buffer) => {
        return method.responseType.decode(new Uint8Array(buffer))
      },
    }
  }

  const ClientConstructor = grpc.makeClientConstructor(grpcServiceDef, definition.name)
  const rawClient = new ClientConstructor(address, credentials, channelOptions)

  // Wrap each method as async Promise
  const client = {} as Record<string, unknown>

  for (const methodKey of Object.keys(definition.methods)) {
    client[methodKey] = (
      request: unknown,
      metadata?: grpc.Metadata,
      options?: grpc.CallOptions
    ): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        const meta = metadata || new grpc.Metadata()
        const opts = options || {}
        const method = rawClient[methodKey] as (...args: unknown[]) => void
        method.call(rawClient, request, meta, opts, (error: grpc.ServiceError | null, response: unknown) => {
          if (error) {
            reject(error)
          } else {
            resolve(response)
          }
        })
      })
    }
  }

  return client as ServiceClient<T>
}
