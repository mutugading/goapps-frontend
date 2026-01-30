import { NextResponse } from "next/server"
// import { getCostingClient, promisifyClient } from "@/services/costing"
import costingData from "@/data/costing.json"

// GET /api/v1/costing/parameters
// Returns a list of all parameters
export async function GET() {
    try {
        // TODO: Replace with actual gRPC call when backend is ready
        // const client = await getCostingClient()
        // const listParameters = promisifyClient(client.listParameters.bind(client))
        // const response = await listParameters({ pageSize: 100 })

        // Using mock data for now
        const response = {
            parameters: costingData.parameters,
            totalCount: costingData.parameters.length,
            nextPageToken: null,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Error fetching parameters:", error)
        return NextResponse.json(
            { error: "Failed to fetch parameters" },
            { status: 500 }
        )
    }
}

// POST /api/v1/costing/parameters
// Creates a new parameter
export async function POST(request: Request) {
    try {
        const body = await request.json()

        // TODO: Replace with actual gRPC call
        // const client = await getCostingClient()
        // const createParameter = promisifyClient(client.createParameter.bind(client))
        // const response = await createParameter(body)

        // Mock response
        const newParameter = {
            id: String(Date.now()),
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        return NextResponse.json(newParameter, { status: 201 })
    } catch (error) {
        console.error("Error creating parameter:", error)
        return NextResponse.json(
            { error: "Failed to create parameter" },
            { status: 500 }
        )
    }
}
