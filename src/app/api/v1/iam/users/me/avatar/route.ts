// POST /api/v1/iam/users/me/avatar - Upload profile picture
// Accepts multipart/form-data with file, converts to gRPC bytes

import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/auth/cookies"
import { getUserClient, createAuthMetadata, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { jwtDecode } from "jwt-decode"

interface JwtPayload {
    sub: string
    exp: number
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB (matches proto validation)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

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
                    data: null,
                },
                { status: 401 }
            )
        }

        // Decode JWT to get user_id
        let userId: string
        try {
            const decoded = jwtDecode<JwtPayload>(accessToken)
            userId = decoded.sub
        } catch {
            return NextResponse.json(
                {
                    base: {
                        isSuccess: false,
                        statusCode: "401",
                        message: "Invalid token",
                        validationErrors: [],
                    },
                    data: null,
                },
                { status: 401 }
            )
        }

        // Parse multipart form data
        const formData = await request.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json(
                {
                    base: {
                        isSuccess: false,
                        statusCode: "400",
                        message: "No file provided",
                        validationErrors: [{ field: "file", message: "File is required" }],
                    },
                    data: null,
                },
                { status: 400 }
            )
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    base: {
                        isSuccess: false,
                        statusCode: "400",
                        message: "Invalid file type. Allowed: JPEG, PNG, WebP",
                        validationErrors: [{ field: "file", message: `Invalid type: ${file.type}` }],
                    },
                    data: null,
                },
                { status: 400 }
            )
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    base: {
                        isSuccess: false,
                        statusCode: "400",
                        message: "File too large. Maximum size is 2MB",
                        validationErrors: [{ field: "file", message: `Size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 2MB limit` }],
                    },
                    data: null,
                },
                { status: 400 }
            )
        }

        // Convert file to Uint8Array for gRPC bytes field
        const arrayBuffer = await file.arrayBuffer()
        const fileData = new Uint8Array(arrayBuffer)

        // Call gRPC UploadProfilePicture
        const metadata = createAuthMetadata(accessToken)
        const client = getUserClient()
        const response = await client.uploadProfilePicture(
            {
                userId,
                fileData,
                fileName: file.name,
                contentType: file.type,
            },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            profilePictureUrl: response.profilePictureUrl,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error uploading avatar:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to upload avatar",
                    validationErrors: [],
                },
                data: null,
            },
            { status: 500 }
        )
    }
}
