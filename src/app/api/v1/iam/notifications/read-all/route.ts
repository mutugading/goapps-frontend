// POST /api/v1/iam/notifications/read-all

import { NextRequest, NextResponse } from "next/server"
import { getNotificationClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const metadata = createMetadataFromRequest(request)
    const client = getNotificationClient()
    const response = await client.markAllAsRead({}, metadata)
    return NextResponse.json({ base: response.base, data: { affectedCount: Number(response.affectedCount ?? 0) } })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error marking all read:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to mark all read", validationErrors: [] } },
      { status: 500 },
    )
  }
}
