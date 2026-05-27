// List comments for a request.
import { NextRequest, NextResponse } from "next/server"
import { getCostRequestCommentClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getCostRequestCommentClient()
    const response = await client.listCostRequestComments(
      {
        requestId: Number(requestId),
        includeHidden: searchParams.get("includeHidden") === "true" || searchParams.get("include_hidden") === "true",
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to list comments", validationErrors: [] }, data: [] }, { status: 500 })
  }
}
