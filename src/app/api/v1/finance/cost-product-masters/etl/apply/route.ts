// CostProductMaster ETL - apply selected rows of a preview run (inserts products)
//
// 404 = run not found / preview expired (UI asks the user to preview again).
// 400 = apply limit exceeded or run not in preview state. 503 = Oracle unavailable.

import { NextRequest, NextResponse } from "next/server"
import { getCostProductMasterClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { httpStatusFromBase } from "@/lib/grpc/base-status"

// POST /api/v1/finance/cost-product-masters/etl/apply
// Body: { previewRunId: string (uuid), rowKeys: string[] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const metadata = createMetadataFromRequest(request)
    const rawKeys: unknown[] = Array.isArray(body.rowKeys) ? body.rowKeys : []
    const response = await getCostProductMasterClient().applyProductEtlFromOracle(
      {
        previewRunId: String(body.previewRunId ?? body.preview_run_id ?? ""),
        rowKeys: rawKeys.map((k) => String(k)),
      },
      metadata,
    )
    return NextResponse.json(
      { base: response.base, data: response.data },
      { status: httpStatusFromBase(response.base) },
    )
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error applying product ETL:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to apply Oracle ETL", validationErrors: [] } },
      { status: 500 },
    )
  }
}
