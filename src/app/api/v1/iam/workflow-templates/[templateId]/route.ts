// Workflow Template BFF — get / update / delete by id.

import { NextRequest, NextResponse } from "next/server"
import {
  getWorkflowTemplateClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

type RouteContext = { params: Promise<{ templateId: string }> }

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { templateId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getWorkflowTemplateClient()
    const response = await client.getWorkflowTemplate({ templateId }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error getting workflow template:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to get workflow template", validationErrors: [] } },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { templateId } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getWorkflowTemplateClient()
    // Update creates a new version. Server returns the new version row.
    const response = await client.updateWorkflowTemplate(
      {
        templateId,
        name: body.name || "",
        description: body.description || "",
        steps: Array.isArray(body.steps) ? body.steps : [],
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error updating workflow template:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to update workflow template", validationErrors: [] } },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { templateId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getWorkflowTemplateClient()
    const response = await client.deleteWorkflowTemplate({ templateId }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error deleting workflow template:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to delete workflow template", validationErrors: [] } },
      { status: 500 },
    )
  }
}
