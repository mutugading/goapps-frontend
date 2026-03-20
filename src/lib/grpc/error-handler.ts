// Centralized gRPC error → HTTP response mapping

import * as grpc from "@grpc/grpc-js"
import { NextResponse } from "next/server"

export function isGrpcError(error: unknown): error is grpc.ServiceError {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    "details" in error &&
    typeof (error as grpc.ServiceError).code === "number"
  )
}

const GRPC_TO_HTTP: Record<number, number> = {
  [grpc.status.OK]: 200,
  [grpc.status.CANCELLED]: 499,
  [grpc.status.INVALID_ARGUMENT]: 400,
  [grpc.status.NOT_FOUND]: 404,
  [grpc.status.ALREADY_EXISTS]: 409,
  [grpc.status.PERMISSION_DENIED]: 403,
  [grpc.status.UNAUTHENTICATED]: 401,
  [grpc.status.RESOURCE_EXHAUSTED]: 429,
  [grpc.status.FAILED_PRECONDITION]: 400,
  [grpc.status.ABORTED]: 409,
  [grpc.status.OUT_OF_RANGE]: 400,
  [grpc.status.UNIMPLEMENTED]: 501,
  [grpc.status.INTERNAL]: 500,
  [grpc.status.UNAVAILABLE]: 503,
  [grpc.status.DATA_LOSS]: 500,
  [grpc.status.DEADLINE_EXCEEDED]: 504,
}

export function grpcCodeToHttp(code: number): number {
  return GRPC_TO_HTTP[code] ?? 500
}

export function grpcErrorToResponse(error: grpc.ServiceError) {
  const httpStatus = grpcCodeToHttp(error.code)
  return {
    base: {
      isSuccess: false,
      statusCode: httpStatus.toString(),
      message: error.details || error.message || "gRPC error",
      validationErrors: [] as Array<{ field: string; message: string }>,
    },
  }
}

export function handleGrpcError(error: grpc.ServiceError): NextResponse {
  const httpStatus = grpcCodeToHttp(error.code)
  return NextResponse.json(grpcErrorToResponse(error), { status: httpStatus })
}
