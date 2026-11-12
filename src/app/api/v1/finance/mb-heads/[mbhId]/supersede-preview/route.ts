// Finance MBHead route - Preview supersede (what Validate would replace)

import { NextRequest, NextResponse } from "next/server"
import { getMBHeadClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { httpStatusFromBase } from "@/lib/grpc/base-status"

type RouteContext = { params: Promise<{ mbhId: string }> }

// GET /api/v1/finance/mb-heads/[mbhId]/supersede-preview
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { mbhId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getMBHeadClient()
        const response = await client.previewMBHeadSupersede({ mbhId }, metadata)

        return NextResponse.json(
            { base: response.base, data: response.data },
            { status: httpStatusFromBase(response.base) }
        )
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error previewing MB Head supersede:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to preview MB Head supersede",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
