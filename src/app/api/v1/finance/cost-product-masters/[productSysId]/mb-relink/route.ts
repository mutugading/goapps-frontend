// CostProductMaster route - force MB autofill re-link for a product

import { NextRequest, NextResponse } from "next/server"
import { getCostProductMasterClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { httpStatusFromBase } from "@/lib/grpc/base-status"

type RouteContext = { params: Promise<{ productSysId: string }> }

// POST /api/v1/finance/cost-product-masters/[productSysId]/mb-relink
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { productSysId } = await context.params
    const metadata = createMetadataFromRequest(request)
    const response = await getCostProductMasterClient().relinkCostProductMb(
      { productSysId: Number(productSysId) },
      metadata,
    )
    return NextResponse.json(
      { base: response.base, data: response.data },
      { status: httpStatusFromBase(response.base) },
    )
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error re-linking product MB:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to re-link MB", validationErrors: [] } },
      { status: 500 },
    )
  }
}
