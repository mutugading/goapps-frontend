/* eslint-disable @typescript-eslint/no-explicit-any */
// Finance RM Cost - list audit history

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

function serializeHistory(h: any) {
  if (!h) return undefined
  return {
    historyId: h.historyId || "",
    rmCostId: h.rmCostId ?? undefined,
    jobId: h.jobId ?? undefined,
    period: h.period || "",
    rmCode: h.rmCode || "",
    rmType: h.rmType ?? 0,
    groupHeadId: h.groupHeadId ?? undefined,
    rates: h.rates
      ? {
          cons: h.rates.cons ?? 0,
          stores: h.rates.stores ?? 0,
          dept: h.rates.dept ?? 0,
          po1: h.rates.po1 ?? 0,
          po2: h.rates.po2 ?? 0,
          po3: h.rates.po3 ?? 0,
        }
      : { cons: 0, stores: 0, dept: 0, po1: 0, po2: 0, po3: 0 },
    costPercentage: h.costPercentage ?? 0,
    costPerKg: h.costPerKg ?? 0,
    flagValuation: h.flagValuation ?? 0,
    flagMarketing: h.flagMarketing ?? 0,
    flagSimulation: h.flagSimulation ?? 0,
    initValValuation: h.initValValuation ?? undefined,
    initValMarketing: h.initValMarketing ?? undefined,
    initValSimulation: h.initValSimulation ?? undefined,
    costValuation: h.costValuation ?? undefined,
    costMarketing: h.costMarketing ?? undefined,
    costSimulation: h.costSimulation ?? undefined,
    flagValuationUsed: h.flagValuationUsed ?? 0,
    flagMarketingUsed: h.flagMarketingUsed ?? 0,
    flagSimulationUsed: h.flagSimulationUsed ?? 0,
    sourceItemCount: h.sourceItemCount ?? 0,
    triggerReason: h.triggerReason ?? 0,
    calculatedAt: h.calculatedAt || "",
    calculatedBy: h.calculatedBy || "",
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getRmCostClient()

    const groupHeadId = searchParams.get("groupHeadId") || searchParams.get("group_head_id")
    const jobId = searchParams.get("jobId") || searchParams.get("job_id")

    const response = await client.listRMCostHistory(
      {
        page: Number(searchParams.get("page")) || 1,
        pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 10,
        period: searchParams.get("period") || "",
        rmCode: searchParams.get("rmCode") || searchParams.get("rm_code") || "",
        groupHeadId: groupHeadId || undefined,
        jobId: jobId || undefined,
      },
      metadata
    )

    const data = (response.data || []).map(serializeHistory)

    const pagination = response.pagination
      ? {
          currentPage: response.pagination.currentPage || 1,
          pageSize: response.pagination.pageSize || 10,
          totalItems: Number(response.pagination.totalItems) || 0,
          totalPages: response.pagination.totalPages || 0,
        }
      : { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 }

    return NextResponse.json({
      base: serializeBase(response.base),
      data,
      pagination,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error fetching RM Cost history:", error)
    return NextResponse.json(
      {
        base: { isSuccess: false, statusCode: "500", message: "Failed to fetch RM cost history", validationErrors: [] },
        data: [],
        pagination: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
      },
      { status: 500 }
    )
  }
}
