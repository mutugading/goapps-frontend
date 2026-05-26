import { NextRequest, NextResponse } from "next/server"
import { getCostAuditLogClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getCostAuditLogClient()
    const response = await client.listCostAuditLogs(
      {
        entityType: searchParams.get("entityType") || searchParams.get("entity_type") || "",
        entityId: Number(searchParams.get("entityId") || searchParams.get("entity_id")) || 0,
        userId: searchParams.get("userId") || searchParams.get("user_id") || "",
        operation: searchParams.get("operation") || "",
        fromDate: searchParams.get("fromDate") || searchParams.get("from_date") || "",
        toDate: searchParams.get("toDate") || searchParams.get("to_date") || "",
        pagination: {
          page: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 50,
        },
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data, pagination: response.pagination })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to list audit logs", validationErrors: [] }, data: [] }, { status: 500 })
  }
}
