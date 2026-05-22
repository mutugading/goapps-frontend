import { NextRequest, NextResponse } from "next/server"
import { getCostRoutingRuleClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest, { params }: { params: Promise<{ ruleId: string }> }) {
  try {
    const { ruleId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostRoutingRuleClient()
    const response = await client.getCostRoutingRule({ ruleId: Number(ruleId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to get rule", validationErrors: [] } }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ ruleId: string }> }) {
  try {
    const { ruleId } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostRoutingRuleClient()
    const response = await client.updateCostRoutingRule(
      {
        ruleId: Number(ruleId),
        priority: Number(body.priority ?? 0) || 0,
        condition: body.condition || "",
        actionType: body.actionType || body.action_type || "",
        actionTarget: body.actionTarget || body.action_target || "",
        isActive: Boolean(body.isActive ?? body.is_active ?? true),
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to update rule", validationErrors: [] } }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ ruleId: string }> }) {
  try {
    const { ruleId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostRoutingRuleClient()
    const response = await client.deleteCostRoutingRule({ ruleId: Number(ruleId) }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to delete rule", validationErrors: [] } }, { status: 500 })
  }
}
