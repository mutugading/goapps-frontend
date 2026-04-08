// POST /api/v1/finance/formulas/import - Import Formulas from Excel

import { NextRequest, NextResponse } from "next/server"
import { getFormulaClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getFormulaClient()

        // Convert fileContent array to Uint8Array for gRPC
        const fileContentBytes = new Uint8Array(body.fileContent)

        const response = await client.importFormulas({
            fileContent: fileContentBytes,
            fileName: body.fileName,
            duplicateAction: body.duplicateAction,
        }, metadata)

        return NextResponse.json({
            base: response.base,
            successCount: response.successCount,
            skippedCount: response.skippedCount,
            updatedCount: response.updatedCount,
            failedCount: response.failedCount,
            errors: response.errors,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error importing formulas:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to import formulas",
                    validationErrors: [],
                },
                successCount: 0,
                skippedCount: 0,
                updatedCount: 0,
                failedCount: 0,
                errors: [],
            },
            { status: 500 }
        )
    }
}
