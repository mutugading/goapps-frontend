// CMS Page route - Get by slug (public endpoint)

import { NextRequest, NextResponse } from "next/server"
import { getCmsPageClient, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ slug: string }> }

// GET /api/v1/iam/cms/pages/slug/[slug] - Public, no auth required
export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        const { slug } = await context.params
        const client = getCmsPageClient()
        const response = await client.getCMSPageBySlug({ slug })

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching CMS Page by slug:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch CMS page",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
