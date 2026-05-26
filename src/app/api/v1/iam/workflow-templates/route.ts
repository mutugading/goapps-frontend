// Workflow Template BFF — list + create.

import { NextRequest, NextResponse } from "next/server"
import {
  getWorkflowTemplateClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getWorkflowTemplateClient()

    const response = await client.listWorkflowTemplates(
      {
        search: searchParams.get("search") ?? "",
        kind: searchParams.get("kind") ?? "",
        activeFilter: searchParams.get("activeFilter") ?? searchParams.get("active_filter") ?? "",
        pagination: {
          page: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 20,
        },
        sortBy: searchParams.get("sortBy") ?? searchParams.get("sort_by") ?? "",
        sortOrder: searchParams.get("sortOrder") ?? searchParams.get("sort_order") ?? "",
      },
      metadata,
    )

    return NextResponse.json({
      base: response.base,
      data: response.data,
      pagination: response.pagination,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error listing workflow templates:", error)
    return NextResponse.json(
      {
        base: { isSuccess: false, statusCode: "500", message: "Failed to list workflow templates", validationErrors: [] },
        data: [],
        pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getWorkflowTemplateClient()

    const response = await client.createWorkflowTemplate(
      {
        kind: body.kind || "",
        name: body.name || "",
        description: body.description || "",
        steps: Array.isArray(body.steps) ? body.steps : [],
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error creating workflow template:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to create workflow template", validationErrors: [] } },
      { status: 500 },
    )
  }
}
