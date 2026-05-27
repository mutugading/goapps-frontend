// Caller's notifications. Recipient comes from JWT via gRPC metadata.
import { NextRequest, NextResponse } from "next/server"
import { getCostNotificationClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getCostNotificationClient()
    const response = await client.listMyCostNotifications(
      {
        unreadOnly: searchParams.get("unreadOnly") === "true" || searchParams.get("unread_only") === "true",
        pagination: {
          page: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 20,
        },
      },
      metadata,
    )
    return NextResponse.json({
      base: response.base, data: response.data,
      pagination: response.pagination, unreadCount: response.unreadCount,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to list notifications", validationErrors: [] }, data: [], unreadCount: 0 }, { status: 500 })
  }
}
