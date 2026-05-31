// BI Dashboards — featured (pinned to Executive Dashboard landing page).

import { NextRequest, NextResponse } from "next/server"
import { getBiDashboardClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.listFeaturedDashboards({}, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("List featured BI dashboards error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list featured dashboards", validationErrors: [] }, data: [] },
      { status: 500 }
    )
  }
}
