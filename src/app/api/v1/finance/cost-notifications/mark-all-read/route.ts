import { NextRequest, NextResponse } from "next/server"
import { getCostNotificationClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const metadata = createMetadataFromRequest(request)
    const client = getCostNotificationClient()
    const response = await client.markAllMyCostNotificationsRead({}, metadata)
    return NextResponse.json({ base: response.base, updatedCount: response.updatedCount })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to mark all read", validationErrors: [] } }, { status: 500 })
  }
}
