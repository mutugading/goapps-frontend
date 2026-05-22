// IAM Company Mappings - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import {
    getCompanyMappingClient,
    createMetadataFromRequest,
    isGrpcError,
    handleGrpcError,
} from "@/lib/grpc"

type RouteContext = { params: Promise<{ companyMappingId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { companyMappingId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getCompanyMappingClient()
        const response = await client.getCompanyMapping({ companyMappingId }, metadata)
        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching company mapping:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch company mapping",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { companyMappingId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getCompanyMappingClient()
        const response = await client.updateCompanyMapping(
            { companyMappingId, ...body },
            metadata
        )
        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating company mapping:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update company mapping",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { companyMappingId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getCompanyMappingClient()
        const response = await client.deleteCompanyMapping({ companyMappingId }, metadata)
        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting company mapping:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete company mapping",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
