// Costing Service Client
// This file will be updated when proto types are generated

import { loadProto, getServiceAddress } from "@/lib/grpc"

// Placeholder types - will be replaced with generated types from proto
export interface UnitOfMeasure {
    id: string
    code: string
    name: string
    description: string
    category: string
    status: string
    createdAt?: string
    updatedAt?: string
}

export interface Parameter {
    id: string
    code: string
    name: string
    value: string
    dataType: string
    category: string
    status: string
    createdAt?: string
    updatedAt?: string
}

export interface ListUOMsRequest {
    pageSize?: number
    pageToken?: string
}

export interface ListUOMsResponse {
    uoms: UnitOfMeasure[]
    nextPageToken?: string
    totalCount: number
}

export interface ListParametersRequest {
    pageSize?: number
    pageToken?: string
}

export interface ListParametersResponse {
    parameters: Parameter[]
    nextPageToken?: string
    totalCount: number
}

// Costing Service Client Interface
export interface CostingServiceClient {
    listUOMs(
        request: ListUOMsRequest,
        callback: (error: Error | null, response: ListUOMsResponse) => void
    ): void
    listParameters(
        request: ListParametersRequest,
        callback: (error: Error | null, response: ListParametersResponse) => void
    ): void
}

// Service singleton
let costingClient: CostingServiceClient | null = null

export async function getCostingClient(): Promise<CostingServiceClient> {
    if (!costingClient) {
        // Path to proto file (relative to project root)
        const protoPath = process.env.COSTING_PROTO_PATH || "../goapps-shared-proto/costing/v1/service.proto"

        costingClient = await loadProto<CostingServiceClient>(
            protoPath,
            "costing.v1",
            "CostingService",
            getServiceAddress("costing")
        )
    }
    return costingClient
}
