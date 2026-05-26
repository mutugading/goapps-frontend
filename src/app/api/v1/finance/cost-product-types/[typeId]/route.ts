// CostProductType — get + update by typeId.
import { NextRequest, NextResponse } from "next/server"
import { getCostProductTypeClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest, { params }: { params: Promise<{ typeId: string }> }) {
  try {
    const { typeId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductTypeClient()
    const response = await client.getCostProductType({ typeId: Number(typeId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to get cost product type", validationErrors: [] } }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ typeId: string }> }) {
  try {
    const { typeId } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductTypeClient()
    const response = await client.updateCostProductType({ ...body, typeId: Number(typeId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to update cost product type", validationErrors: [] } }, { status: 500 })
  }
}
