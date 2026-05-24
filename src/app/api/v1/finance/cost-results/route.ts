// CostCalc — list cost results across products (GET). Defaults to the latest
// period + active rows when no filters are supplied.
import { NextRequest, NextResponse } from "next/server"
import { getCostCalcClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { toCalcType, toCostResultStatus } from "@/lib/grpc/cost-calc-enums"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getCostCalcClient()
    const response = await client.listCostResults(
      {
        pagination: {
          page: Number(sp.get("page")) || 1,
          pageSize: Number(sp.get("pageSize")) || 50,
        },
        period: sp.get("period") || "",
        calculationType: toCalcType(sp.get("calculationType")),
        status: toCostResultStatus(sp.get("status")),
        search: sp.get("search") || "",
      },
      metadata,
    )
    return NextResponse.json({
      base: response.base,
      data: response.items,
      resolvedPeriod: response.resolvedPeriod,
      pagination: response.pagination
        ? {
            currentPage: response.pagination.currentPage,
            pageSize: response.pagination.pageSize,
            totalItems: String(response.pagination.totalItems ?? 0),
            totalPages: response.pagination.totalPages,
          }
        : undefined,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list cost results", validationErrors: [] }, data: [] },
      { status: 500 },
    )
  }
}
