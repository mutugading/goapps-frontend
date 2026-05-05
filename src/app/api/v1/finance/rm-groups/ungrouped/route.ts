/* eslint-disable @typescript-eslint/no-explicit-any */
// Finance RM Group — list grouping monitor (ungrouped or grouped scope).

import { NextRequest, NextResponse } from "next/server"
import { getRmGroupClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { RMGroupingScope } from "@/types/generated/finance/v1/rm_group"

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

function parseScope(raw: string | null): RMGroupingScope {
  if (raw === "grouped") return RMGroupingScope.RM_GROUPING_SCOPE_GROUPED
  return RMGroupingScope.RM_GROUPING_SCOPE_UNGROUPED
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
        search: searchParams.get("search") || "",
        scope: parseScope(searchParams.get("scope")),
        sortBy: searchParams.get("sort_by") || searchParams.get("sortBy") || "",
        sortOrder: searchParams.get("sort_order") || searchParams.get("sortOrder") || "",
      },
      metadata
    )

    const data = (response.data || []).map((item) => ({
      itemCode: item.itemCode || "",
      itemName: item.itemName || "",
      itemTypeCode: item.itemTypeCode || "",
      gradeCode: item.gradeCode || "",
      itemGrade: item.itemGrade || "",
      uomCode: item.uomCode || "",
      groupHeadId: item.groupHeadId || "",
      groupCode: item.groupCode || "",
      groupName: item.groupName || "",
      sortOrder: item.sortOrder ?? 0,
      assignedAt: item.assignedAt || "",
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
    console.error("Error fetching grouping monitor:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to fetch grouping monitor",
          validationErrors: [],
        },
        data: [],
        pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      },
      { status: 500 }
    )
  }
}
