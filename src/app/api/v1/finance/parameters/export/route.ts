// GET /api/v1/finance/parameters/export - Export Parameters to Excel

import { NextRequest, NextResponse } from "next/server"
import { getParameterClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const metadata = createMetadataFromRequest(request)
        const client = getParameterClient()

        const response = await client.exportParameters(
            {
                dataType: Number(searchParams.get("dataType") || searchParams.get("data_type")) || 0,
                paramCategory: Number(searchParams.get("paramCategory") || searchParams.get("param_category")) || 0,
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
        console.error("Error exporting Parameters:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to export parameters",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
