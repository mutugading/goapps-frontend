// Finance RM Cost routes - List

import { NextRequest, NextResponse } from "next/server"
import { getRmCostClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getRmCostClient()

    const groupHeadId = searchParams.get("groupHeadId") || searchParams.get("group_head_id")

    const response = await client.listRMCosts(
      {
        page: Number(searchParams.get("page")) || 1,
        pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 10,
        period: searchParams.get("period") || "",
        rmType: Number(searchParams.get("rmType") || searchParams.get("rm_type")) || 0,
        groupHeadId: groupHeadId || undefined,
        search: searchParams.get("search") || "",
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
    console.error("Error fetching RM Costs:", error)
    return NextResponse.json(
      {
        base: { isSuccess: false, statusCode: "500", message: "Failed to fetch RM costs", validationErrors: [] },
        data: [],
        pagination: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
      },
      { status: 500 }
    )
  }
}
