// POST /api/v1/finance/costing/import/bulk_params_only
// Params-only bulk import: product_parameters + product_applicable_params.
// Products must already exist from a prior bulk_product_routing import.
// Accepts JSON body: { fileContent: number[], fileName: string }
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
    const fileContent = new Uint8Array(body.fileContent as number[])
    const fileName: string = body.fileName ?? ""

    const res = await getCostDataImportClient().importBulkParamsOnly(
      { fileContent, fileName },
      metadata,
    )

    return NextResponse.json({
      base: res.base,
      data: { jobId: res.jobId, status: res.status },
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error importing bulk params:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to import params",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
