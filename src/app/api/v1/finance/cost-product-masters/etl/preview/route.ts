// CostProductMaster ETL - preview products to import from Oracle legacy (read-only)
//
// Oracle not configured/unreachable comes back as base.statusCode "503" (mapped to HTTP 503).
// Apply-limit / invalid from_date are 400; the UI shows the raw message.

import { NextRequest, NextResponse } from "next/server"
import { getCostProductMasterClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { httpStatusFromBase } from "@/lib/grpc/base-status"

// POST /api/v1/finance/cost-product-masters/etl/preview
// Body: { fromDate: "YYYY-MM-DD", search?: string, includeExisting?: boolean }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const metadata = createMetadataFromRequest(request)
    const response = await getCostProductMasterClient().previewProductEtlFromOracle(
      {
        fromDate: String(body.fromDate ?? body.from_date ?? ""),
        search: String(body.search ?? ""),
        includeExisting: body.includeExisting === true || body.include_existing === true,
      },
      metadata,
    )
    return NextResponse.json(
      { base: response.base, data: response.data },
      { status: httpStatusFromBase(response.base) },
    )
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error previewing product ETL:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to preview Oracle ETL", validationErrors: [] } },
      { status: 500 },
    )
  }
}
