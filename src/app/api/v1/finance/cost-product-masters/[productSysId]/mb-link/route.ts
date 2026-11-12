// CostProductMaster route - resolve MB spin link (FG_MATCH | SHADE_ONLY | SUPERBA | NONE)

import { NextRequest, NextResponse } from "next/server"
import { getCostProductMasterClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { httpStatusFromBase } from "@/lib/grpc/base-status"

type RouteContext = { params: Promise<{ productSysId: string }> }

// GET /api/v1/finance/cost-product-masters/[productSysId]/mb-link
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { productSysId } = await context.params
    const metadata = createMetadataFromRequest(request)
    const response = await getCostProductMasterClient().getCostProductMbLink(
      { productSysId: Number(productSysId) },
      metadata,
    )
    return NextResponse.json(
      { base: response.base, data: response.data },
      { status: httpStatusFromBase(response.base) },
    )
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error fetching product MB link:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to get MB link", validationErrors: [] } },
      { status: 500 },
    )
  }
}
