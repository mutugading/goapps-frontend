// Finance MBSpin route - Un-supersede (revert a supersede of a spin)

import { NextRequest, NextResponse } from "next/server"
import { getMBSpinClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { httpStatusFromBase } from "@/lib/grpc/base-status"

type RouteContext = { params: Promise<{ id: string }> }

// POST /api/v1/finance/mb-spins/[id]/unsupersede
//
// Body (optional): { mbhId?: string }. Forwards `data`, `paramsReverted` and `skipped`
// verbatim so the UI can show what was reverted and which param rows were skipped.
export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params
        const body = await request.json().catch(() => ({}))
        const metadata = createMetadataFromRequest(request)
        const client = getMBSpinClient()
        const response = await client.unsupersedeMBSpin(
            { mbsId: id, mbhId: body?.mbhId ?? "" },
            metadata
        )

        return NextResponse.json(
            {
                base: response.base,
                data: response.data,
                paramsReverted: response.paramsReverted,
                skipped: response.skipped,
            },
            { status: httpStatusFromBase(response.base) }
        )
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error un-superseding MB Spin:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to un-supersede MB spin",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
