// Finance MBHead workflow route - Validate (freezes cost/param snapshot)
//
// Optional body `{ confirmSupersede: true }` confirms superseding older spins reported
// by PreviewMBHeadSupersede. The body is tolerant: empty or invalid JSON means "no confirm".
// Like the other MB Head transitions this route keeps HTTP 200 and reports failures via
// `base` (the client checks base.statusCode === "409" + SUPERSEDE_CONFIRMATION_REQUIRED prefix).

import { NextRequest, NextResponse } from "next/server"
import { getMBHeadClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ mbhId: string }> }

// POST /api/v1/finance/mb-heads/[mbhId]/validate
export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { mbhId } = await context.params
        const body = await request.json().catch(() => ({}))
        const confirmSupersede = body?.confirmSupersede === true || body?.confirm_supersede === true
        const metadata = createMetadataFromRequest(request)
        const client = getMBHeadClient()
        const response = await client.validateMBHead({ mbhId, confirmSupersede }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error validating MB Head:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to validate MB Head",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
