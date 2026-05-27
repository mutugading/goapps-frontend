// IAM Company Mappings routes - List and Create

import { NextRequest, NextResponse } from "next/server"
import {
    getCompanyMappingClient,
    createMetadataFromRequest,
    isGrpcError,
    handleGrpcError,
} from "@/lib/grpc"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const metadata = createMetadataFromRequest(request)
        const client = getCompanyMappingClient()

        const response = await client.listCompanyMappings(
            {
                page: Number(searchParams.get("page")) || 1,
                pageSize:
                    Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 10,
                search: searchParams.get("search") || "",
                activeFilter:
                    Number(searchParams.get("activeFilter") || searchParams.get("active_filter")) || 0,
                companyId:
                    searchParams.get("companyId") || searchParams.get("company_id") || undefined,
                divisionId:
                    searchParams.get("divisionId") || searchParams.get("division_id") || undefined,
                departmentId:
                    searchParams.get("departmentId") ||
                    searchParams.get("department_id") ||
                    undefined,
                sectionId:
                    searchParams.get("sectionId") || searchParams.get("section_id") || undefined,
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
        console.error("Error fetching company mappings:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch company mappings",
                    validationErrors: [],
                },
                data: [],
                pagination: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
            },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getCompanyMappingClient()
        const response = await client.createCompanyMapping(body, metadata)
        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error creating company mapping:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to create company mapping",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
