// Finance MBSpin routes - List and Create

import { NextRequest, NextResponse } from "next/server"
import { getMBSpinClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

// GET /api/v1/finance/mb-spins - List MB Spins with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const metadata = createMetadataFromRequest(request)
        const client = getMBSpinClient()

        const response = await client.listMBSpins(
            {
                page: Number(searchParams.get("page")) || 1,
                pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 10,
                search: searchParams.get("search") || "",
                mbhId: searchParams.get("mbhId") || searchParams.get("mbh_id") || "",
                activeFilter: Number(searchParams.get("activeFilter") || searchParams.get("active_filter")) || 0,
                sortBy: searchParams.get("sortBy") || searchParams.get("sort_by") || "",
                sortOrder: searchParams.get("sortOrder") || searchParams.get("sort_order") || "",
            },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            data: response.data,
            pagination: response.pagination,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching MB Spins:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch MB spins",
                    validationErrors: [],
                },
                data: [],
                pagination: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
            },
            { status: 500 }
        )
    }
}

// POST /api/v1/finance/mb-spins - Create MB Spin
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getMBSpinClient()

        const response = await client.createMBSpin(body, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error creating MB Spin:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to create MB spin",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
