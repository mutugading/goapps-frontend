// Workflow Instance BFF — GET single instance with steps preloaded.

import { NextRequest, NextResponse } from "next/server"
import {
  getWorkflowInstanceClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

type RouteContext = { params: Promise<{ instanceId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { instanceId } = await context.params
    const metadata = createMetadataFromRequest(request)
    const client = getWorkflowInstanceClient()
    const response = await client.getWorkflowInstance({ instanceId }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error getting workflow instance:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to get workflow instance", validationErrors: [] } },
      { status: 500 },
    )
  }
}
