/* eslint-disable @typescript-eslint/no-explicit-any */
// Finance RM Group - list ungrouped items for a period

import { NextRequest, NextResponse } from "next/server"
import { getRmGroupClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getRmGroupClient()

    const response = await client.listUngroupedItems(
      {
        page: Number(searchParams.get("page")) || 1,
        pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 20,
        period: searchParams.get("period") || "",
        search: searchParams.get("search") || "",
      },
      metadata
    )

    // Explicitly serialize ungrouped items
    const data = (response.data || []).map((item) => ({
      period: item.period || "",
      itemCode: item.itemCode || "",
      itemName: item.itemName || "",
      itemTypeCode: item.itemTypeCode || "",
      gradeCode: item.gradeCode || "",
      itemGrade: item.itemGrade || "",
      uomCode: item.uomCode || "",
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

    const pagination = response.pagination
      ? {
          currentPage: response.pagination.currentPage || 1,
          pageSize: response.pagination.pageSize || 20,
          totalItems: Number(response.pagination.totalItems) || 0,
          totalPages: response.pagination.totalPages || 0,
        }
      : { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 }

    return NextResponse.json({
      base: serializeBase(response.base),
      data,
      pagination,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error fetching ungrouped items:", error)
    return NextResponse.json(
      {
        base: { isSuccess: false, statusCode: "500", message: "Failed to fetch ungrouped items", validationErrors: [] },
        data: [],
        pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      },
      { status: 500 }
    )
  }
}
