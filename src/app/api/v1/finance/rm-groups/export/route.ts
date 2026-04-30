// GET /api/v1/finance/rm-groups/export - Export RM Groups to Excel

import { NextRequest, NextResponse } from "next/server"
import { getRmGroupClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getRmGroupClient()

    // Comma-separated list of group_head_id UUIDs for the "Selected" mode.
    const idsParam = searchParams.get("group_head_ids") || searchParams.get("groupHeadIds") || ""
    const groupHeadIds = idsParam
      ? idsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    const response = await client.exportRMGroups(
      {
        activeFilter:
          Number(searchParams.get("activeFilter") || searchParams.get("active_filter")) || 0,
        search: searchParams.get("search") || "",
        groupHeadIds,
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
    console.error("Error exporting RM Groups:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to export RM groups",
          validationErrors: [],
        },
      },
      { status: 500 }
    )
  }
}
