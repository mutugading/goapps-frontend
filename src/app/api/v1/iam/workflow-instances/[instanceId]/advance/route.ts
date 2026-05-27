// Workflow Instance BFF — POST advance approves the current step.

import { NextRequest, NextResponse } from "next/server"
import {
  getWorkflowInstanceClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

type RouteContext = { params: Promise<{ instanceId: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { instanceId } = await context.params
    const body = await request.json().catch(() => ({} as { comment?: string }))
    const metadata = createMetadataFromRequest(request)
    const client = getWorkflowInstanceClient()

    const response = await client.advanceWorkflowInstance(
      { instanceId, comment: body.comment || "" },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error advancing workflow instance:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to advance workflow", validationErrors: [] } },
      { status: 500 },
    )
  }
}
