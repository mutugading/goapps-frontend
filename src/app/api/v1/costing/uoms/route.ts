import { NextResponse } from "next/server"
// import { getCostingClient, promisifyClient } from "@/services/costing"
import costingData from "@/data/costing.json"

// GET /api/v1/costing/uoms
// Returns a list of all units of measure
export async function GET() {
    try {
        // TODO: Replace with actual gRPC call when backend is ready
        // const client = await getCostingClient()
        // const listUOMs = promisifyClient(client.listUOMs.bind(client))
        // const response = await listUOMs({ pageSize: 100 })

        // Using mock data for now
        const response = {
            uoms: costingData.uoms,
            totalCount: costingData.uoms.length,
            nextPageToken: null,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Error fetching UOMs:", error)
        return NextResponse.json(
            { error: "Failed to fetch units of measure" },
            { status: 500 }
        )
    }
}

// POST /api/v1/costing/uoms
// Creates a new unit of measure
export async function POST(request: Request) {
    try {
        const body = await request.json()

        // TODO: Replace with actual gRPC call
        // const client = await getCostingClient()
        // const createUOM = promisifyClient(client.createUOM.bind(client))
        // const response = await createUOM(body)

        // Mock response
        const newUOM = {
            id: String(Date.now()),
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        return NextResponse.json(newUOM, { status: 201 })
    } catch (error) {
        console.error("Error creating UOM:", error)
        return NextResponse.json(
            { error: "Failed to create unit of measure" },
            { status: 500 }
        )
    }
}
