// BI config-change audit — list (GET).

import { NextRequest, NextResponse } from "next/server"
import {
  getBiDashboardClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"
import { normalizeAuditEntry } from "@/types/bi"
import type { RawAuditEntry } from "@/types/bi"

// GET /api/v1/finance/bi/audit — paginated config-change history.
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.listConfigAudit(
      {
        page: Number(sp.get("page")) || 1,
        pageSize: Number(sp.get("pageSize") || sp.get("page_size")) || 20,
        entityType: sp.get("entityType") || sp.get("entity_type") || "",
      },
      metadata
    )
    const data = (response.data ?? []).map((entry) =>
      normalizeAuditEntry(entry as unknown as RawAuditEntry)
    )
    return NextResponse.json({
      base: response.base,
      data,
      pagination: response.pagination,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("List BI config audit error:", error)
    return NextResponse.json(
      {
        base: { isSuccess: false, statusCode: "500", message: "Failed to list config audit", validationErrors: [] },
        data: [],
        pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      },
      { status: 500 }
    )
  }
}
