// CMS Settings routes - List and Bulk Update

import { NextRequest, NextResponse } from "next/server"
import { getCmsSettingClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

// GET /api/v1/iam/cms/settings - List CMS Settings (optionally by group)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const metadata = createMetadataFromRequest(request)
        const client = getCmsSettingClient()

        const group = searchParams.get("group") || ""

        const response = await client.listCMSSettings({ settingGroup: group }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching CMS Settings:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch CMS settings",
                    validationErrors: [],
                },
                data: [],
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/iam/cms/settings - Bulk Update CMS Settings
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getCmsSettingClient()

        const response = await client.bulkUpdateCMSSettings(body, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error bulk updating CMS Settings:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update CMS settings",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
