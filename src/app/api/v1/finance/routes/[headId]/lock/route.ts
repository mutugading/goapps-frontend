import { NextRequest, NextResponse } from "next/server"
import { jwtDecode } from "jwt-decode"
import {
  getCostRouteClient,
  getAuthClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ headId: string }> }) {
  try {
    const { headId } = await params
    const body = (await request.json()) as { password?: string }

    if (!body.password) {
      return NextResponse.json(
        { base: { isSuccess: false, statusCode: "400", message: "Password required", validationErrors: [] } },
        { status: 400 },
      )
    }

    const accessToken = request.cookies.get("goapps_access_token")?.value
    if (!accessToken) {
      return NextResponse.json(
        { base: { isSuccess: false, statusCode: "401", message: "Unauthenticated", validationErrors: [] } },
        { status: 401 },
      )
    }

    const decoded = jwtDecode<{ sub?: string }>(accessToken)
    const userId = decoded.sub
    if (!userId) {
      return NextResponse.json(
        { base: { isSuccess: false, statusCode: "401", message: "Invalid token", validationErrors: [] } },
        { status: 401 },
      )
    }

    const metadata = createMetadataFromRequest(request)

    // Verify password via IAM
    const authClient = getAuthClient()
    const verifyResp = await authClient.verifyPassword({ userId, password: body.password }, metadata)
    if (!verifyResp.base?.isSuccess) {
      return NextResponse.json(
        {
          base: verifyResp.base ?? {
            isSuccess: false,
            statusCode: "401",
            message: "Invalid password",
            validationErrors: [],
          },
        },
        { status: 401 },
      )
    }

    // Lock the route
    const routeClient = getCostRouteClient()
    const response = await routeClient.lockRoute({ headId: Number(headId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to lock route", validationErrors: [] } },
      { status: 500 },
    )
  }
}
