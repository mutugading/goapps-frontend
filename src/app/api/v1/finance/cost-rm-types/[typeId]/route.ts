// CostRmType — get + update by typeId.
import { NextRequest, NextResponse } from "next/server"
import { getCostRmTypeClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest, { params }: { params: Promise<{ typeId: string }> }) {
  try {
    const { typeId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostRmTypeClient()
    const response = await client.getCostRmType({ typeId: Number(typeId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to get cost rm type", validationErrors: [] } }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ typeId: string }> }) {
  try {
    const { typeId } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostRmTypeClient()
    const response = await client.updateCostRmType({ ...body, typeId: Number(typeId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to update cost rm type", validationErrors: [] } }, { status: 500 })
  }
}
