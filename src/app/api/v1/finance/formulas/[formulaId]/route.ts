// Finance Formula routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getFormulaClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ formulaId: string }> }

// GET /api/v1/finance/formulas/[formulaId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { formulaId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getFormulaClient()
        const response = await client.getFormula({ formulaId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching formula:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch formula",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/finance/formulas/[formulaId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { formulaId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getFormulaClient()
        const response = await client.updateFormula({ formulaId, ...body }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating formula:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update formula",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/finance/formulas/[formulaId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { formulaId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getFormulaClient()
        const response = await client.deleteFormula({ formulaId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting formula:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete formula",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
