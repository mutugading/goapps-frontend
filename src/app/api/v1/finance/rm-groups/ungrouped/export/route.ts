// GET /api/v1/finance/rm-groups/ungrouped/export — Export grouping monitor to Excel.

import { NextRequest, NextResponse } from "next/server"
import { getRmGroupClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { RMGroupingScope } from "@/types/generated/finance/v1/rm_group"

function parseScope(raw: string | null): RMGroupingScope {
  if (raw === "grouped") return RMGroupingScope.RM_GROUPING_SCOPE_GROUPED
  return RMGroupingScope.RM_GROUPING_SCOPE_UNGROUPED
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getRmGroupClient()

    const response = await client.exportUngroupedItems(
      {
        search: searchParams.get("search") || "",
        scope: parseScope(searchParams.get("scope")),
        sortBy: searchParams.get("sort_by") || searchParams.get("sortBy") || "",
        sortOrder: searchParams.get("sort_order") || searchParams.get("sortOrder") || "",
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
    console.error("Error exporting grouping monitor:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to export grouping monitor",
          validationErrors: [],
        },
      },
      { status: 500 }
    )
  }
}
