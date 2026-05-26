import { NextRequest, NextResponse } from "next/server"
import { getCostNotificationClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ notificationId: string }> }) {
  try {
    const { notificationId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostNotificationClient()
    const response = await client.markCostNotificationRead({ notificationId: Number(notificationId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to mark read", validationErrors: [] } }, { status: 500 })
  }
}
