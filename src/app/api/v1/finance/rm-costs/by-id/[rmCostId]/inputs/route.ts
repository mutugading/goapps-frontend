/* eslint-disable @typescript-eslint/no-explicit-any */
// V2: UpdateRMCostInputs — edit per-row marketing inputs / simulation_rate / flags.

import { NextRequest, NextResponse } from "next/server"
import { getRmCostClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import {
  RMValuationFlag,
  rMValuationFlagFromJSON,
  RMMarketingFlag,
  rMMarketingFlagFromJSON,
} from "@/types/generated/finance/v1/rm_group"

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

function parseValuationFlag(s: string | undefined): number | undefined {
  if (!s) return undefined
  try {
    return rMValuationFlagFromJSON(s)
  } catch {
    return RMValuationFlag.RM_VALUATION_FLAG_UNSPECIFIED
  }
}

function parseMarketingFlag(s: string | undefined): number | undefined {
  if (!s) return undefined
  try {
    return rMMarketingFlagFromJSON(s)
  } catch {
    return RMMarketingFlag.RM_MARKETING_FLAG_UNSPECIFIED
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ rmCostId: string }> },
) {
  try {
    const { rmCostId } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getRmCostClient()

    const response = await client.updateRMCostInputs(
      {
        rmCostId,
        marketingFreightRate: body.marketingFreightRate ?? undefined,
        marketingAntiDumpingPct: body.marketingAntiDumpingPct ?? undefined,
        marketingDutyPct: body.marketingDutyPct ?? undefined,
        marketingTransportRate: body.marketingTransportRate ?? undefined,
        marketingDefaultValue: body.marketingDefaultValue ?? undefined,
        simulationRate: body.simulationRate ?? undefined,
        valuationFlag: parseValuationFlag(body.valuationFlag),
        marketingFlag: parseMarketingFlag(body.marketingFlag),
        clearMarketingFreightRate: body.clearMarketingFreightRate ?? false,
        clearMarketingAntiDumpingPct: body.clearMarketingAntiDumpingPct ?? false,
        clearMarketingDutyPct: body.clearMarketingDutyPct ?? false,
        clearMarketingTransportRate: body.clearMarketingTransportRate ?? false,
        clearMarketingDefaultValue: body.clearMarketingDefaultValue ?? false,
        clearSimulationRate: body.clearSimulationRate ?? false,
      },
      metadata,
    )

    return NextResponse.json({
      base: serializeBase(response.base),
      data: response.data || null,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error updating RM Cost inputs:", error)
    return NextResponse.json(
      {
        base: { isSuccess: false, statusCode: "500", message: "Failed to update inputs", validationErrors: [] },
      },
      { status: 500 },
    )
  }
}
