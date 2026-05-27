/* eslint-disable @typescript-eslint/no-explicit-any */
// Finance RM Group items - Add, Remove items within a group

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

function serializeDetail(detail: any) {
  if (!detail) return undefined
  return {
    groupDetailId: detail.groupDetailId || "",
    groupHeadId: detail.groupHeadId || "",
    itemCode: detail.itemCode || "",
    itemName: detail.itemName || "",
    itemTypeCode: detail.itemTypeCode || "",
    gradeCode: detail.gradeCode || "",
    itemGrade: detail.itemGrade || "",
    uomCode: detail.uomCode || "",
    marketPercentage: detail.marketPercentage ?? undefined,
    marketValueRp: detail.marketValueRp ?? undefined,
    sortOrder: detail.sortOrder ?? 0,
    isActive: detail.isActive ?? true,
    isDummy: detail.isDummy ?? false,
  }
}

function serializeSkipped(skipped: any) {
  if (!skipped) return undefined
  return {
    itemCode: skipped.itemCode || "",
    owningGroupHeadId: skipped.owningGroupHeadId || "",
    owningGroupDetailId: skipped.owningGroupDetailId || "",
    owningGroupCode: skipped.owningGroupCode || "",
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { groupHeadId } = await context.params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getRmGroupClient()
    // Forward either the structured `selections` (preferred, carries
    // grade_code) or the legacy `itemCodes`.
    const selections = Array.isArray(body.selections)
      ? body.selections.map((s: { itemCode?: string; gradeCode?: string }) => ({
          itemCode: s.itemCode || "",
          gradeCode: s.gradeCode || "",
        }))
      : []
    const response = await client.addItems(
      {
        groupHeadId,
        itemCodes: body.itemCodes || [],
        selections,
      },
      metadata
    )
    return NextResponse.json({
      base: serializeBase(response.base),
      added: (response.added || []).map(serializeDetail),
      skipped: (response.skipped || []).map(serializeSkipped),
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error adding items to RM Group:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to add items", validationErrors: [] } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { groupHeadId } = await context.params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getRmGroupClient()
    const response = await client.removeItems(
      {
        groupHeadId,
        groupDetailIds: body.groupDetailIds || body.detailIds || [],
        mode: Number(body.mode) || 0,
      },
      metadata
    )
    return NextResponse.json({
      base: serializeBase(response.base),
      removedCount: response.removedCount ?? 0,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error removing items from RM Group:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to remove items", validationErrors: [] } },
      { status: 500 }
    )
  }
}
