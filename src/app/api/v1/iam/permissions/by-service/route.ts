// IAM Permissions by Service - Get grouped permissions

import { NextRequest, NextResponse } from "next/server"
import { getPermissionClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

// GET /api/v1/iam/permissions/by-service
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const metadata = createMetadataFromRequest(request)
        const client = getPermissionClient()

        const response = await client.getPermissionsByService(
            {
                serviceName: searchParams.get("serviceName") || searchParams.get("service_name") || "",
                includeInactive: searchParams.get("includeInactive") === "true",
            },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching permissions by service:", error)
        return NextResponse.json(
            {
                base: { isSuccess: false, statusCode: "500", message: "Failed to fetch permissions", validationErrors: [] },
                data: [],
            },
            { status: 500 }
        )
    }
}
