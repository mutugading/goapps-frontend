// Workflow Template Activate route — POST activates this version + deactivates siblings.

import { NextRequest, NextResponse } from "next/server"
import {
  getWorkflowTemplateClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

type RouteContext = { params: Promise<{ templateId: string }> }

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { templateId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getWorkflowTemplateClient()
    const response = await client.activateWorkflowTemplate({ templateId }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error activating workflow template:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to activate workflow template", validationErrors: [] } },
      { status: 500 },
    )
  }
}
