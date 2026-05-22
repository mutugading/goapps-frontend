// IAM Companies - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getCompanyClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ companyId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { companyId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getCompanyClient()
        const response = await client.getCompany({ companyId }, metadata)
        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching company:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to fetch company", validationErrors: [] } },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { companyId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getCompanyClient()
        const response = await client.updateCompany({ companyId, ...body }, metadata)
        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating company:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to update company", validationErrors: [] } },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { companyId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getCompanyClient()
        const response = await client.deleteCompany({ companyId }, metadata)
        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting company:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to delete company", validationErrors: [] } },
            { status: 500 }
        )
    }
}
