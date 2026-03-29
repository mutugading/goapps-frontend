// CMS Setting routes - Get and Update by key

import { NextRequest, NextResponse } from "next/server"
import { getCmsSettingClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ settingKey: string }> }

// GET /api/v1/iam/cms/settings/[settingKey]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { settingKey } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getCmsSettingClient()
        const response = await client.getCMSSetting({ settingKey }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching CMS Setting:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch CMS setting",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/iam/cms/settings/[settingKey]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { settingKey } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getCmsSettingClient()
        const response = await client.updateCMSSetting({ settingKey, ...body }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating CMS Setting:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update CMS setting",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
