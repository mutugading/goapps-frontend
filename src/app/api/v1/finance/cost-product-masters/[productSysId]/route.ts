// CostProductMaster — get + update by sys_id.
import { NextRequest, NextResponse } from "next/server"
import { getCostProductMasterClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest, { params }: { params: Promise<{ productSysId: string }> }) {
  try {
    const { productSysId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductMasterClient()
    const response = await client.getCostProductMaster({ productSysId: Number(productSysId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to get cost product master", validationErrors: [] } }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ productSysId: string }> }) {
  try {
    const { productSysId } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductMasterClient()
    const response = await client.updateCostProductMaster({ ...body, productSysId: Number(productSysId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to update cost product master", validationErrors: [] } }, { status: 500 })
  }
}
