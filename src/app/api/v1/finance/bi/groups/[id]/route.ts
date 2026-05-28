// BI Dashboard Groups — update + delete by ID.

import { NextRequest, NextResponse } from "next/server"
import { getBiDashboardClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.updateDashboardGroup({ ...body, groupId: id }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Update BI group error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to update group", validationErrors: [] } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.deleteDashboardGroup({ groupId: id }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Delete BI group error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to delete group", validationErrors: [] } },
      { status: 500 }
    )
  }
}
