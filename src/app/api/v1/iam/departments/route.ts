// IAM Departments routes - List (used by department dropdown / lookup)

import { NextRequest, NextResponse } from "next/server"
import {
    getDepartmentClient,
    createMetadataFromRequest,
    isGrpcError,
    handleGrpcError,
} from "@/lib/grpc"

// GET /api/v1/iam/departments - List Departments (defaults to page=1 / pageSize=200 for dropdowns)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const metadata = createMetadataFromRequest(request)
        const client = getDepartmentClient()

        const response = await client.listDepartments(
            {
                page: Number(searchParams.get("page")) || 1,
                pageSize:
                    Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 200,
                search: searchParams.get("search") || "",
                activeFilter:
                    Number(
                        searchParams.get("activeFilter") || searchParams.get("active_filter")
                    ) || 0,
                divisionId:
                    searchParams.get("divisionId") || searchParams.get("division_id") || undefined,
                companyId:
                    searchParams.get("companyId") || searchParams.get("company_id") || undefined,
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
        console.error("Error fetching departments:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch departments",
                    validationErrors: [],
                },
                data: [],
                pagination: { currentPage: 1, pageSize: 200, totalItems: 0, totalPages: 0 },
            },
            { status: 500 }
        )
    }
}

// POST /api/v1/iam/departments
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getDepartmentClient()
        const response = await client.createDepartment(body, metadata)
        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error creating department:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to create department", validationErrors: [] } },
            { status: 500 }
        )
    }
}
