// POST /api/v1/finance/interminglings/import - Import Interminglings from Excel

import { NextRequest, NextResponse } from "next/server"
import { getInterminglingClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getInterminglingClient()

        // Convert JSON array back to Uint8Array for gRPC
        const fileContentBytes = new Uint8Array(body.fileContent as number[])

        const response = await client.importInterminglings(
            {
                fileContent: fileContentBytes,
                fileName: body.fileName || "",
                duplicateAction: body.duplicateAction || "skip",
            },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            successCount: response.successCount,
            skippedCount: response.skippedCount,
            failedCount: response.failedCount,
            errors: response.errors,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error importing Interminglings:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to import interminglings",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
