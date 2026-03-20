// gRPC Metadata helpers for request context

import * as grpc from "@grpc/grpc-js"
import type { NextRequest } from "next/server"

export function createAuthMetadata(accessToken: string): grpc.Metadata {
  const metadata = new grpc.Metadata()
  metadata.set("authorization", `Bearer ${accessToken}`)
  return metadata
}

export function createMetadataFromRequest(request: NextRequest, accessToken?: string): grpc.Metadata {
  const metadata = new grpc.Metadata()

  // Set auth token
  if (accessToken) {
    metadata.set("authorization", `Bearer ${accessToken}`)
  } else {
    const token = request.cookies.get("goapps_access_token")?.value
    if (token) {
      metadata.set("authorization", `Bearer ${token}`)
    }
  }

  // Forward tracing headers
  const requestId = request.headers.get("x-request-id")
  if (requestId) {
    metadata.set("x-request-id", requestId)
  }

  const userAgent = request.headers.get("user-agent")
  if (userAgent) {
    metadata.set("user-agent", userAgent)
  }

  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    metadata.set("x-forwarded-for", forwardedFor)
  }

  return metadata
}
