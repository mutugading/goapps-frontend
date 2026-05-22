// CostCalc — list versioned cost history for a product.
import { NextRequest, NextResponse } from "next/server"
import { getCostCalcClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { toCalcType } from "@/lib/grpc/cost-calc-enums"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productSysId: string }> },
) {
  try {
    const { productSysId } = await params
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getCostCalcClient()
    const response = await client.listCostHistory(
      {
        productSysId: Number(productSysId),
        pagination: {
          page: Number(sp.get("page")) || 1,
          pageSize: Number(sp.get("pageSize")) || 20,
        },
        calculationType: toCalcType(sp.get("calculationType")),
      },
      metadata,
    )
    return NextResponse.json({
      base: response.base,
      data: response.items,
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
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list cost history", validationErrors: [] }, data: [] },
      { status: 500 },
    )
  }
}
