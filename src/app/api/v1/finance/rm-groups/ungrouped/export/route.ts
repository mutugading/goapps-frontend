// GET /api/v1/finance/rm-groups/ungrouped/export - Export Ungrouped Items to Excel

import { NextRequest, NextResponse } from "next/server"
import { getRmGroupClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getRmGroupClient()

    const response = await client.exportUngroupedItems(
      {
        period: searchParams.get("period") || "",
        search: searchParams.get("search") || "",
      },
      metadata
    )

    const fileContentBase64 = Buffer.from(response.fileContent).toString("base64")

    return NextResponse.json({
      base: response.base,
      fileContent: fileContentBase64,
      fileName: response.fileName,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error exporting Ungrouped Items:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to export ungrouped items",
          validationErrors: [],
        },
      },
      { status: 500 }
    )
  }
}
