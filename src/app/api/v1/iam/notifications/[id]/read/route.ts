// POST /api/v1/iam/notifications/{id}/read

import { NextRequest, NextResponse } from "next/server"
import { getNotificationClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const metadata = createMetadataFromRequest(request)
    const client = getNotificationClient()
    const response = await client.markAsRead({ notificationId: id }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error marking notification read:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to mark read", validationErrors: [] } },
      { status: 500 },
    )
  }
}
