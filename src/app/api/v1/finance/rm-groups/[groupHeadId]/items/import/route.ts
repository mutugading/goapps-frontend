// POST /api/v1/finance/rm-groups/{groupHeadId}/items/import
// Bulk-assign items to ONE existing group from Excel.

import { NextRequest, NextResponse } from "next/server"
import { getRmGroupClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ groupHeadId: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { groupHeadId } = await context.params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getRmGroupClient()

    const fileContentBytes = new Uint8Array(body.fileContent)

    const response = await client.importGroupItems(
      {
        groupHeadId,
        fileContent: fileContentBytes,
        fileName: body.fileName,
      },
      metadata
    )

    return NextResponse.json({
      base: response.base,
      itemsAdded: response.itemsAdded,
      itemsSkipped: response.itemsSkipped,
      failedCount: response.failedCount,
      errors: response.errors,
      skipped: response.skipped,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error importing group items:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to import group items",
          validationErrors: [],
        },
        itemsAdded: 0,
        itemsSkipped: 0,
        failedCount: 0,
        errors: [],
        skipped: [],
      },
      { status: 500 }
    )
  }
}
