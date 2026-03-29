// CMS Pages routes - List and Create

import { NextRequest, NextResponse } from "next/server"
import { getCmsPageClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

// GET /api/v1/iam/cms/pages - List CMS Pages with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const metadata = createMetadataFromRequest(request)
        const client = getCmsPageClient()

        // Build isPublished filter
        const publishedParam = searchParams.get("isPublished") || searchParams.get("is_published")
        let isPublished: boolean | undefined
        if (publishedParam === "true") isPublished = true
        else if (publishedParam === "false") isPublished = false

        const response = await client.listCMSPages(
            {
                page: Number(searchParams.get("page")) || 1,
                pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 10,
                search: searchParams.get("search") || "",
                isPublished,
                sortBy: searchParams.get("sortBy") || searchParams.get("sort_by") || "",
                sortOrder: searchParams.get("sortOrder") || searchParams.get("sort_order") || "",
            },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            data: response.data,
            pagination: response.pagination,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching CMS Pages:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch CMS pages",
                    validationErrors: [],
                },
                data: [],
                pagination: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
            },
            { status: 500 }
        )
    }
}

// POST /api/v1/iam/cms/pages - Create CMS Page
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getCmsPageClient()

        const response = await client.createCMSPage(body, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error creating CMS Page:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to create CMS page",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
