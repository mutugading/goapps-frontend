// Public Landing Content route - No auth required

import { NextResponse } from "next/server"
import { getCmsSectionClient, isGrpcError, handleGrpcError } from "@/lib/grpc"

// GET /api/v1/public/landing - Get all published sections + settings
export async function GET() {
    try {
        const client = getCmsSectionClient()
        const response = await client.getPublicLandingContent({})

        return NextResponse.json({
            base: response.base,
            sections: response.sections,
            settings: response.settings,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching landing content:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch landing content",
                    validationErrors: [],
                },
                sections: [],
                settings: [],
            },
            { status: 500 }
        )
    }
}
