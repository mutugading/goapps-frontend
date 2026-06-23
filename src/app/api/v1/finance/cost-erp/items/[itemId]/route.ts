// CostErpItem — get, update, delete by ID.
import { NextRequest, NextResponse } from "next/server"
import { getCostErpClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ itemId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { itemId } = await context.params
    const metadata = createMetadataFromRequest(request)
    const response = await getCostErpClient().getCostErpItem({ itemId: Number(itemId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to get ERP item", validationErrors: [] } }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { itemId } = await context.params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const response = await getCostErpClient().updateCostErpItem(
      {
        itemId: Number(itemId),
        itemName: body.itemName ?? body.item_name ?? undefined,
        itemType: body.itemType ?? body.item_type ?? undefined,
        isActive: body.isActive ?? body.is_active ?? undefined,
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to update ERP item", validationErrors: [] } }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { itemId } = await context.params
    const metadata = createMetadataFromRequest(request)
    const response = await getCostErpClient().deleteCostErpItem({ itemId: Number(itemId) }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to delete ERP item", validationErrors: [] } }, { status: 500 })
  }
}
