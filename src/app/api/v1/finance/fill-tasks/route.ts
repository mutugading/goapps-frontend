// Fill tasks — list by request_id query param.
import { NextRequest, NextResponse } from "next/server"
import { getFillTaskClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = Number(searchParams.get("request_id") || searchParams.get("requestId")) || 0
    const metadata = createMetadataFromRequest(request)
    const client = getFillTaskClient()
    const response = await client.listFillTasks({ requestId }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list fill tasks", validationErrors: [] }, data: [] },
      { status: 500 },
    )
  }
}
