// GET /api/v1/iam/notifications/unread-count

import { NextRequest, NextResponse } from "next/server"
import { getNotificationClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const metadata = createMetadataFromRequest(request)
    const client = getNotificationClient()
    const response = await client.getUnreadCount({}, metadata)
    return NextResponse.json({ base: response.base, data: { unreadCount: Number(response.unreadCount ?? 0) } })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error fetching unread count:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to fetch unread count", validationErrors: [] }, data: { unreadCount: 0 } },
      { status: 500 },
    )
  }
}
