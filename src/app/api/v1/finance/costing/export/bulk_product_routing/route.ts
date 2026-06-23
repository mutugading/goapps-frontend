// POST /api/v1/finance/costing/export/bulk_product_routing
// Queue an async export of product master + routing data to MinIO.
// Accepts JSON body: { productTypeCodes?: string[] }
// Returns: { jobId: number, status: string }

import { NextRequest, NextResponse } from "next/server"
import {
  getCostDataImportClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const productTypeCodes: string[] = Array.isArray(body.productTypeCodes)
      ? (body.productTypeCodes as string[])
      : []
    const productSysIds: number[] = Array.isArray(body.productSysIds)
      ? (body.productSysIds as unknown[]).map(Number)
      : []

    const includeRouting: boolean =
      typeof body.includeRouting === "boolean" ? body.includeRouting : true
    const activeOnly: boolean =
      typeof body.activeOnly === "boolean" ? body.activeOnly : false

    const res = await getCostDataImportClient().exportBulkProductRouting(
      { productTypeCodes, productSysIds, includeRouting, activeOnly },
      metadata,
    )

    return NextResponse.json({
      base: res.base,
      jobId: res.jobId,
      status: res.status,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error exporting bulk product routing:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to export bulk product routing",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
