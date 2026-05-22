import { NextRequest, NextResponse } from "next/server"
import { getCostRoutingRuleClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getCostRoutingRuleClient()
    const response = await client.listCostRoutingRules(
      {
        activeFilter: searchParams.get("activeFilter") || searchParams.get("active_filter") || "",
        pagination: {
          page: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 50,
        },
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data, pagination: response.pagination })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to list rules", validationErrors: [] }, data: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostRoutingRuleClient()
    const response = await client.createCostRoutingRule(
      {
        priority: Number(body.priority ?? 0) || 0,
        condition: body.condition || "",
        actionType: body.actionType || body.action_type || "",
        actionTarget: body.actionTarget || body.action_target || "",
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to create rule", validationErrors: [] } }, { status: 500 })
  }
}
