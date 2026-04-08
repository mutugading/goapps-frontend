// GET /api/v1/finance/formulas/export - Export Formulas to Excel

import { NextRequest, NextResponse } from "next/server"
import { getFormulaClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const metadata = createMetadataFromRequest(request)
        const client = getFormulaClient()

        const response = await client.exportFormulas(
            {
                formulaType: Number(searchParams.get("formulaType") || searchParams.get("formula_type")) || 0,
                activeFilter: Number(searchParams.get("activeFilter") || searchParams.get("active_filter")) || 0,
            },
            metadata
        )

        // Convert Uint8Array to base64 string for JSON serialization
        const fileContentBase64 = Buffer.from(response.fileContent).toString('base64')

        return NextResponse.json({
            base: response.base,
            fileContent: fileContentBase64,
            fileName: response.fileName,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error exporting formulas:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to export formulas",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
