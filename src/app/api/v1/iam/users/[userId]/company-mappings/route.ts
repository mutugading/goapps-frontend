// User Company Mappings - List + Assign

import { NextRequest, NextResponse } from "next/server"
import { getUserClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ userId: string }> }

// GET: list mappings assigned to a user
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { userId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getUserClient()
        const response = await client.getUserCompanyMappings({ userId }, metadata)
        return NextResponse.json({
            base: response.base,
            data: response.data,
            primaryCompanyMappingId: response.primaryCompanyMappingId,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching user company mappings:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch user company mappings",
                    validationErrors: [],
                },
                data: [],
                primaryCompanyMappingId: "",
            },
            { status: 500 }
        )
    }
}

// POST: assign a mapping to a user. body: { companyMappingId, isPrimary }
export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { userId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getUserClient()
        const response = await client.assignUserCompanyMapping(
            {
                userId,
                companyMappingId: body.companyMappingId,
                isPrimary: !!body.isPrimary,
            },
            metadata
        )
        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error assigning user company mapping:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to assign user company mapping",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
