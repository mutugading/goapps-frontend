// gRPC Client Configuration for Next.js Server-Side

import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader"
import path from "path"

// Default gRPC options
const GRPC_OPTIONS: protoLoader.Options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
}

// Service endpoints configuration
export const grpcConfig = {
    // Costing Service
    costing: {
        host: process.env.COSTING_SERVICE_HOST || "localhost",
        port: process.env.COSTING_SERVICE_PORT || "50051",
    },
    // Future services can be added here
    // iam: { host: ..., port: ... },
}

// Get service address
export function getServiceAddress(service: keyof typeof grpcConfig): string {
    const config = grpcConfig[service]
    return `${config.host}:${config.port}`
}

// Load proto file and create client
export async function loadProto<T>(
    protoPath: string,
    packageName: string,
    serviceName: string,
    serviceAddress: string
): Promise<T> {
    const absolutePath = path.resolve(protoPath)

    const packageDefinition = await protoLoader.load(absolutePath, GRPC_OPTIONS)
    const proto = grpc.loadPackageDefinition(packageDefinition)

    // Navigate to the service
    const packageParts = packageName.split(".")
    let servicePackage: Record<string, unknown> = proto

    for (const part of packageParts) {
        servicePackage = servicePackage[part] as Record<string, unknown>
    }

    const ServiceConstructor = servicePackage[serviceName] as new (
        address: string,
        credentials: grpc.ChannelCredentials
    ) => T

    return new ServiceConstructor(
        serviceAddress,
        grpc.credentials.createInsecure()
    )
}

// Promisify gRPC client methods
export function promisifyClient<TRequest, TResponse>(
    method: (
        request: TRequest,
        callback: (error: grpc.ServiceError | null, response: TResponse) => void
    ) => void
): (request: TRequest) => Promise<TResponse> {
    return (request: TRequest) =>
        new Promise((resolve, reject) => {
            method(request, (error, response) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(response)
                }
            })
        })
}
