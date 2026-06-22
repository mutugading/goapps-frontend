// POST /api/v1/finance/costing/import/bulk_product_routing
// Import product master + routing data from an Excel file.
// Accepts JSON body: { fileContent: number[], fileName: string, duplicateAction?: string }
// Returns: { base, data: { jobId: number } }

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
    const duplicateAction: string = body.duplicateAction ?? "update"

    const res = await getCostDataImportClient().importBulkProductRouting(
      { fileContent, fileName, duplicateAction },
      metadata,
    )

    return NextResponse.json({
      base: res.base,
      data: { jobId: res.jobId, status: res.status },
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error importing bulk product routing:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to import bulk product routing",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
