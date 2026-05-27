import { NextRequest, NextResponse } from "next/server"
import { getCostNotificationClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const metadata = createMetadataFromRequest(request)
    const client = getCostNotificationClient()
    const response = await client.getMyCostNotificationUnreadCount({}, metadata)
    return NextResponse.json({ base: response.base, unreadCount: response.unreadCount })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to get unread count", validationErrors: [] }, unreadCount: 0 }, { status: 500 })
  }
}
