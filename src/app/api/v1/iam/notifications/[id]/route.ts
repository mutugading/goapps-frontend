// Notification — Get single + Delete

import { NextRequest, NextResponse } from "next/server"
import { getNotificationClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const metadata = createMetadataFromRequest(request)
    const client = getNotificationClient()
    const response = await client.getNotification({ notificationId: id }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error fetching notification:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to fetch notification", validationErrors: [] } },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const metadata = createMetadataFromRequest(request)
    const client = getNotificationClient()
    const response = await client.deleteNotification({ notificationId: id }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to delete notification", validationErrors: [] } },
      { status: 500 },
    )
  }
}
