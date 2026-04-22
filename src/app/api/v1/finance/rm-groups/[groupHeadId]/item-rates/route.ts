/* eslint-disable @typescript-eslint/no-explicit-any */
// Finance RM Group - per-item per-stage rates for a period

import { NextRequest, NextResponse } from "next/server"
import { getRmGroupClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ groupHeadId: string }> }

function serializeBase(base: any) {
  return base
    ? {
        isSuccess: base.isSuccess ?? false,
        statusCode: base.statusCode || "200",
        message: base.message || "",
        validationErrors: base.validationErrors || [],
      }
    : { isSuccess: true, statusCode: "200", message: "OK", validationErrors: [] }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { groupHeadId } = await context.params
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || ""
    const metadata = createMetadataFromRequest(request)
    const client = getRmGroupClient()

    const response = await client.getRMGroupItemRates({ groupHeadId, period }, metadata)

    const data = (response.data || []).map((item: any) => ({
      itemCode: item.itemCode || "",
      itemName: item.itemName || "",
      gradeCode: item.gradeCode || "",
      itemGrade: item.itemGrade || "",
      uomCode: item.uomCode || "",
      isActive: item.isActive ?? true,
      isDummy: item.isDummy ?? false,
      period: item.period || "",
      consQty: item.consQty ?? 0,
      consVal: item.consVal ?? 0,
      consRate: item.consRate ?? 0,
      storesQty: item.storesQty ?? 0,
      storesVal: item.storesVal ?? 0,
      storesRate: item.storesRate ?? 0,
      deptQty: item.deptQty ?? 0,
      deptVal: item.deptVal ?? 0,
      deptRate: item.deptRate ?? 0,
      lastPoQty1: item.lastPoQty1 ?? 0,
      lastPoVal1: item.lastPoVal1 ?? 0,
      lastPoRate1: item.lastPoRate1 ?? 0,
      lastPoQty2: item.lastPoQty2 ?? 0,
      lastPoVal2: item.lastPoVal2 ?? 0,
      lastPoRate2: item.lastPoRate2 ?? 0,
      lastPoQty3: item.lastPoQty3 ?? 0,
      lastPoVal3: item.lastPoVal3 ?? 0,
      lastPoRate3: item.lastPoRate3 ?? 0,
    }))

    return NextResponse.json({ base: serializeBase(response.base), data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error fetching RM group item rates:", error)
    return NextResponse.json(
      {
        base: { isSuccess: false, statusCode: "500", message: "Failed to fetch item rates", validationErrors: [] },
        data: [],
      },
      { status: 500 }
    )
  }
}
