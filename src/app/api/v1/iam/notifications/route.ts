// IAM Notification routes — List + Create

import { NextRequest, NextResponse } from "next/server"
import { getNotificationClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

// GET /api/v1/iam/notifications - List notifications for the caller.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getNotificationClient()

    const response = await client.listNotifications(
      {
        page: Number(searchParams.get("page")) || 1,
        pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 10,
        status: Number(searchParams.get("status")) || 0,
        type: Number(searchParams.get("type")) || 0,
        sortOrder: searchParams.get("sortOrder") || searchParams.get("sort_order") || "",
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
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      {
        base: { isSuccess: false, statusCode: "500", message: "Failed to fetch notifications", validationErrors: [] },
        data: [],
        pagination: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
      },
      { status: 500 },
    )
  }
}

// POST /api/v1/iam/notifications - Create notification (admin / system use).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getNotificationClient()
    const response = await client.createNotification(body, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to create notification", validationErrors: [] } },
      { status: 500 },
    )
  }
}
