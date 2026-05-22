// Remove a company mapping from a user

import { NextRequest, NextResponse } from "next/server"
import { getUserClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ userId: string; companyMappingId: string }> }

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { userId, companyMappingId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getUserClient()
        const response = await client.removeUserCompanyMapping(
            { userId, companyMappingId },
            metadata
        )
        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error removing user company mapping:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to remove user company mapping",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
