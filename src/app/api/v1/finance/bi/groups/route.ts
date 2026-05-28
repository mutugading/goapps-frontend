// BI Dashboard Groups — list + create.

import { NextRequest, NextResponse } from "next/server"
import { getBiDashboardClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.listDashboardGroups(
      { includeInactive: sp.get("includeInactive") === "true" },
      metadata
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("List BI groups error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list groups", validationErrors: [] }, data: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.createDashboardGroup(body, metadata)
    return NextResponse.json({ base: response.base, data: response.data }, { status: 201 })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Create BI group error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to create group", validationErrors: [] } },
      { status: 500 }
    )
  }
}
