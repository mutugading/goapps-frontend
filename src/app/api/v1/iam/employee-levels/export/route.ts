// GET /api/v1/iam/employee-levels/export - Export Employee Levels to Excel

import { NextRequest, NextResponse } from "next/server"
import { getEmployeeLevelClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const metadata = createMetadataFromRequest(request)
        const client = getEmployeeLevelClient()

        const response = await client.exportEmployeeLevels(
            {
                activeFilter: Number(searchParams.get("activeFilter") || searchParams.get("active_filter")) || 0,
                type: Number(searchParams.get("type")) || 0,
                workflow: Number(searchParams.get("workflow")) || 0,
            },
            metadata
        )

        const fileContentBase64 = Buffer.from(response.fileContent).toString('base64')

        return NextResponse.json({
            base: response.base,
            fileContent: fileContentBase64,
            fileName: response.fileName,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error exporting employee levels:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to export employee levels",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
