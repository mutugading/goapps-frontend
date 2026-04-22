/* eslint-disable @typescript-eslint/no-explicit-any */
// Finance RM Cost - get single cost row by (period, rmCode)

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

function serializeCost(cost: any) {
  if (!cost) return undefined
  return {
    rmCostId: cost.rmCostId || "",
    period: cost.period || "",
    rmCode: cost.rmCode || "",
    rmType: cost.rmType ?? 0,
    groupHeadId: cost.groupHeadId ?? undefined,
    itemCode: cost.itemCode ?? undefined,
    rmName: cost.rmName || "",
    uomCode: cost.uomCode || "",
    rates: cost.rates
      ? {
          cons: cost.rates.cons ?? 0,
          stores: cost.rates.stores ?? 0,
          dept: cost.rates.dept ?? 0,
          po1: cost.rates.po1 ?? 0,
          po2: cost.rates.po2 ?? 0,
          po3: cost.rates.po3 ?? 0,
        }
      : { cons: 0, stores: 0, dept: 0, po1: 0, po2: 0, po3: 0 },
    costValuation: cost.costValuation ?? undefined,
    costMarketing: cost.costMarketing ?? undefined,
    costSimulation: cost.costSimulation ?? undefined,
    flagValuation: cost.flagValuation ?? 0,
    flagMarketing: cost.flagMarketing ?? 0,
    flagSimulation: cost.flagSimulation ?? 0,
    flagValuationUsed: cost.flagValuationUsed ?? 0,
    flagMarketingUsed: cost.flagMarketingUsed ?? 0,
    flagSimulationUsed: cost.flagSimulationUsed ?? 0,
    calculatedAt: cost.calculatedAt || "",
    calculatedBy: cost.calculatedBy || "",
  }
}

type RouteContext = { params: Promise<{ period: string; rmCode: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { period, rmCode } = await context.params
    const metadata = createMetadataFromRequest(request)
    const client = getRmCostClient()

    const response = await client.getRMCost(
      { period, rmCode: decodeURIComponent(rmCode) },
      metadata
    )

    return NextResponse.json({
      base: serializeBase(response.base),
      data: serializeCost(response.data),
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error fetching RM Cost:", error)
    return NextResponse.json(
      {
        base: { isSuccess: false, statusCode: "500", message: "Failed to fetch RM cost", validationErrors: [] },
      },
      { status: 500 }
    )
  }
}
