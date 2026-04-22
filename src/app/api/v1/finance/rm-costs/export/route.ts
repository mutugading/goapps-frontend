// GET /api/v1/finance/rm-costs/export - Export RM Costs to Excel

import { NextRequest, NextResponse } from "next/server"
import { getRmCostClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getRmCostClient()

    const groupHeadId = searchParams.get("groupHeadId") || searchParams.get("group_head_id")

    const response = await client.exportRMCosts(
      {
        period: searchParams.get("period") || "",
        rmType: Number(searchParams.get("rmType") || searchParams.get("rm_type")) || 0,
        groupHeadId: groupHeadId || undefined,
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
    console.error("Error exporting RM Costs:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to export RM costs",
          validationErrors: [],
        },
      },
      { status: 500 }
    )
  }
}
