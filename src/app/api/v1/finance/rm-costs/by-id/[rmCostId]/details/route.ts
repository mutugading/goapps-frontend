/* eslint-disable @typescript-eslint/no-explicit-any */
// V2: List per-(item, grade) snapshot rows for one RM Cost row.

import { NextRequest, NextResponse } from "next/server"
import { getRmCostClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

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

function serializeAudit(audit: any) {
  if (!audit) return undefined
  return {
    createdAt: audit.createdAt || "",
    createdBy: audit.createdBy || "",
    updatedAt: audit.updatedAt || "",
    updatedBy: audit.updatedBy || "",
  }
}

function serializeDetail(d: any) {
  return {
    costDetailId: d.costDetailId || "",
    costId: d.costId || "",
    period: d.period || "",
    groupHeadId: d.groupHeadId || "",
    groupDetailId: d.groupDetailId || undefined,
    itemCode: d.itemCode || "",
    itemName: d.itemName || "",
    gradeCode: d.gradeCode || "",
    freightRate: d.freightRate,
    antiDumpingPct: d.antiDumpingPct,
    dutyPct: d.dutyPct,
    transportRate: d.transportRate,
    valuationDefaultValue: d.valuationDefaultValue,
    consVal: d.consVal,
    consQty: d.consQty,
    consRate: d.consRate,
    consFreightVal: d.consFreightVal,
    consValBased: d.consValBased,
    consRateBased: d.consRateBased,
    consAntiDumpingVal: d.consAntiDumpingVal,
    consAntiDumpingRate: d.consAntiDumpingRate,
    consDutyVal: d.consDutyVal,
    consDutyRate: d.consDutyRate,
    consTransportVal: d.consTransportVal,
    consTransportRate: d.consTransportRate,
    consLandedCost: d.consLandedCost,
    stockVal: d.stockVal,
    stockQty: d.stockQty,
    stockRate: d.stockRate,
    stockFreightVal: d.stockFreightVal,
    stockValBased: d.stockValBased,
    stockRateBased: d.stockRateBased,
    stockAntiDumpingVal: d.stockAntiDumpingVal,
    stockAntiDumpingRate: d.stockAntiDumpingRate,
    stockDutyVal: d.stockDutyVal,
    stockDutyRate: d.stockDutyRate,
    stockTransportVal: d.stockTransportVal,
    stockTransportRate: d.stockTransportRate,
    stockLandedCost: d.stockLandedCost,
    poVal: d.poVal,
    poQty: d.poQty,
    poRate: d.poRate,
    fixRate: d.fixRate,
    fixFreightRate: d.fixFreightRate,
    fixRateBased: d.fixRateBased,
    fixAntiDumpingRate: d.fixAntiDumpingRate,
    fixDutyRate: d.fixDutyRate,
    fixTransportRate: d.fixTransportRate,
    fixLandedCost: d.fixLandedCost,
    audit: serializeAudit(d.audit),
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rmCostId: string }> },
) {
  try {
    const { rmCostId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getRmCostClient()
    const response = await client.listCostDetails({ rmCostId }, metadata)
    return NextResponse.json({
      base: serializeBase(response.base),
      data: (response.data || []).map(serializeDetail),
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error listing cost details:", error)
    return NextResponse.json(
      {
        base: { isSuccess: false, statusCode: "500", message: "Failed to list cost details", validationErrors: [] },
        data: [],
      },
      { status: 500 },
    )
  }
}
