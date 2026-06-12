// Fill-assignment global config — list + upsert.
import { NextRequest, NextResponse } from "next/server"
import { getFillConfigClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const metadata = createMetadataFromRequest(request)
    const client = getFillConfigClient()
    const response = await client.listGlobalConfigs({}, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list fill configs", validationErrors: [] }, data: [] },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getFillConfigClient()
    const response = await client.upsertLevelConfig(
      {
        routeLevel: Number(body.routeLevel ?? body.route_level ?? 0) || 0,
        tier: body.tier ?? "GLOBAL",
        productSysId: Number(body.productSysId ?? body.product_sys_id ?? 0) || 0,
        requestId: Number(body.requestId ?? body.request_id ?? 0) || 0,
        fillerType: body.fillerType ?? body.filler_type ?? "",
        fillerValue: body.fillerValue ?? body.filler_value ?? "",
        approverType: body.approverType ?? body.approver_type ?? "",
        approverValue: body.approverValue ?? body.approver_value ?? "",
        reapproveOnChange: Boolean(body.reapproveOnChange ?? body.reapprove_on_change ?? false),
        slaFillHours: Number(body.slaFillHours ?? body.sla_fill_hours ?? 0) || 0,
        slaApproveHours: Number(body.slaApproveHours ?? body.sla_approve_hours ?? 0) || 0,
      },
      metadata,
    )
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to upsert fill config", validationErrors: [] } },
      { status: 500 },
    )
  }
}
