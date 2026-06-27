// POST /api/v1/finance/costing/import/bulk_params_only
// Accepts multipart/form-data ("file" field) to avoid JSON number-array inflation:
// a 50 MB binary file as JSON becomes ~200 MB — this sends the actual binary bytes.
// Falls back to JSON body (small files only) for backward compatibility.
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
    const metadata = createMetadataFromRequest(request)
    const client = getCostDataImportClient()

    let fileContent: Uint8Array
    let fileName: string

    const contentType = request.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file") as File | null
      if (!file) {
        return NextResponse.json(
          {
            base: {
              isSuccess: false,
              statusCode: "400",
              message: "Missing 'file' field in form data",
              validationErrors: [],
            },
          },
          { status: 400 },
        )
      }
      fileContent = new Uint8Array(await file.arrayBuffer())
      fileName = file.name
    } else {
      // Legacy JSON fallback
      const body = await request.json()
      fileContent = new Uint8Array(body.fileContent as number[])
      fileName = body.fileName ?? ""
    }

    const res = await client.importBulkParamsOnly(
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
