// POST /api/v1/iam/cms/upload - Upload CMS image to MinIO
// Accepts multipart/form-data with file + folder, converts to gRPC bytes

import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/auth/cookies"
import { getCmsSectionClient, createAuthMetadata, isGrpcError, handleGrpcError } from "@/lib/grpc"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB (matches proto validation)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]

export async function POST(request: NextRequest) {
    try {
        const accessToken = await getAccessToken()

        if (!accessToken) {
            return NextResponse.json(
                {
                    base: {
                        isSuccess: false,
                        statusCode: "401",
                        message: "Not authenticated",
                        validationErrors: [],
                    },
                },
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const folder = (formData.get("folder") as string) || "sections"

        if (!file) {
            return NextResponse.json(
                {
                    base: {
                        isSuccess: false,
                        statusCode: "400",
                        message: "No file provided",
                        validationErrors: [{ field: "file", message: "File is required" }],
                    },
                },
                { status: 400 }
            )
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    base: {
                        isSuccess: false,
                        statusCode: "400",
                        message: "Invalid file type. Allowed: JPEG, PNG, WebP, SVG",
                        validationErrors: [{ field: "file", message: `Invalid type: ${file.type}` }],
                    },
                },
                { status: 400 }
            )
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    base: {
                        isSuccess: false,
                        statusCode: "400",
                        message: "File too large. Maximum size is 5MB",
                        validationErrors: [{ field: "file", message: `Size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 5MB limit` }],
                    },
                },
                { status: 400 }
            )
        }

        const arrayBuffer = await file.arrayBuffer()
        const fileData = new Uint8Array(arrayBuffer)

        const metadata = createAuthMetadata(accessToken)
        const client = getCmsSectionClient()
        const response = await client.uploadCMSImage(
            {
                folder,
                fileData,
                fileName: file.name,
                contentType: file.type,
            },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            imageUrl: response.imageUrl,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error uploading CMS image:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to upload image",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
