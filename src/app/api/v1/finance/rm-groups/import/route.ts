// POST /api/v1/finance/rm-groups/import - Import RM Groups from Excel

import { NextRequest, NextResponse } from "next/server"
import { getRmGroupClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getRmGroupClient()

    const fileContentBytes = new Uint8Array(body.fileContent)

    const response = await client.importRMGroups(
      {
        fileContent: fileContentBytes,
        fileName: body.fileName,
        duplicateAction: body.duplicateAction || "skip",
      },
      metadata
    )

    return NextResponse.json({
      base: response.base,
      groupsCreated: response.groupsCreated,
      groupsUpdated: response.groupsUpdated,
      groupsSkipped: response.groupsSkipped,
      itemsAdded: response.itemsAdded,
      itemsSkipped: response.itemsSkipped,
      failedCount: response.failedCount,
      errors: response.errors,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error importing RM Groups:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to import RM groups",
          validationErrors: [],
        },
        groupsCreated: 0,
        groupsUpdated: 0,
        groupsSkipped: 0,
        itemsAdded: 0,
        itemsSkipped: 0,
        failedCount: 0,
        errors: [],
      },
      { status: 500 }
    )
  }
}
