// GET /api/v1/finance/rm-groups/items/template
// Download the per-group items import template (one sheet: item_code,
// grade_code, sort_order).

import { NextRequest, NextResponse } from "next/server"
import { getRmGroupClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const metadata = createMetadataFromRequest(request)
    const client = getRmGroupClient()
    const response = await client.downloadGroupItemsTemplate({}, metadata)

    const fileContentBase64 = Buffer.from(response.fileContent).toString("base64")

    return NextResponse.json({
      base: response.base,
      fileContent: fileContentBase64,
      fileName: response.fileName,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error downloading group items template:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to download template",
          validationErrors: [],
        },
      },
      { status: 500 }
    )
  }
}
