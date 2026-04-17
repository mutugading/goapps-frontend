// Item Cons Stock PO route - List synced data

import { NextRequest, NextResponse } from "next/server"
import { getOracleSyncClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

// GET /api/v1/finance/item-cons-stock-po - List item consumption stock PO data
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const metadata = createMetadataFromRequest(request)
        const client = getOracleSyncClient()

        const response = await client.listItemConsStockPO(
            {
                page: Number(searchParams.get("page")) || 1,
                pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 10,
                period: searchParams.get("period") || "",
                itemCode: searchParams.get("itemCode") || searchParams.get("item_code") || "",
                search: searchParams.get("search") || "",
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
        console.error("Error fetching item cons stock PO:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch item consumption stock PO data",
                    validationErrors: [],
                },
                data: [],
                pagination: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
            },
            { status: 500 }
        )
    }
}
