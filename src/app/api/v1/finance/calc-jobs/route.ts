// CostCalc — list jobs (GET) + trigger job (POST).
import { NextRequest, NextResponse } from "next/server"
import { getCostCalcClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { toCalcType, toScope, toJobStatus } from "@/lib/grpc/cost-calc-enums"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getCostCalcClient()
    const response = await client.listCalcJobs(
      {
        pagination: {
          page: Number(sp.get("page")) || 1,
          pageSize: Number(sp.get("pageSize")) || 20,
        },
        period: sp.get("period") || "",
        calculationType: toCalcType(sp.get("calculationType")),
        status: toJobStatus(sp.get("status")),
        triggeredBy: sp.get("triggeredBy") || "",
      },
      metadata,
    )
    return NextResponse.json({
      base: response.base,
      data: response.items,
      pagination: response.pagination
        ? {
            currentPage: response.pagination.currentPage,
            pageSize: response.pagination.pageSize,
            totalItems: String(response.pagination.totalItems ?? 0),
            totalPages: response.pagination.totalPages,
          }
        : undefined,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list calc jobs", validationErrors: [] }, data: [] },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const metadata = createMetadataFromRequest(request)
    const client = getCostCalcClient()
    const response = await client.triggerCalcJob(
      {
        period: String(body.period || ""),
        calculationType: toCalcType(body.calculationType),
        scope: toScope(body.scope),
        productSysId: Number(body.productSysId) || 0,
        routeHeadId: Number(body.routeHeadId) || 0,
        productTypeIdFilter: Number(body.productTypeIdFilter) || 0,
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.job })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to trigger calc job", validationErrors: [] } },
      { status: 500 },
    )
  }
}
