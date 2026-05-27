// BI Upload — download a blank .xlsx template for a target type.

import { NextRequest, NextResponse } from "next/server"
import { getBiUploadClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

export async function GET(request: NextRequest) {
  try {
    const targetType = request.nextUrl.searchParams.get("type") || ""
    if (!targetType) {
      return NextResponse.json(
        { base: { isSuccess: false, statusCode: "400", message: "Missing target type", validationErrors: [] } },
        { status: 400 }
      )
    }

    const metadata = createMetadataFromRequest(request)
    const client = getBiUploadClient()
    const response = await client.downloadUploadTemplate({ targetType }, metadata)

    if (!response.base?.isSuccess) {
      return NextResponse.json(
        { base: response.base },
        { status: Number(response.base?.statusCode) || 500 }
      )
    }

    const fileName = response.fileName || `bi_upload_template_${targetType}.xlsx`
    const bytes = response.fileContent ?? new Uint8Array(0)
    // Copy into a fresh ArrayBuffer so the Response body is a clean Blob source.
    const body = new Uint8Array(bytes)

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": XLSX_MIME,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(body.byteLength),
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Download BI upload template error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to download template", validationErrors: [] } },
      { status: 500 }
    )
  }
}
