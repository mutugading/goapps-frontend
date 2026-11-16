// Shared payroll BFF helpers. `_lib` is ignored by Next.js routing (underscore prefix).
// BFF only forwards the user's token to gRPC and relays the response; no business logic (T030a).
// gRPC → HTTP: PERIOD_CLOSED / PERIOD_APPROVED (AlreadyExists) → 409, PermissionDenied → 403
// (mapping lives in src/lib/grpc/error-handler.ts).

import { NextRequest, NextResponse } from "next/server"
import { getPayrollClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export type PayrollClient = ReturnType<typeof getPayrollClient>
type Meta = ReturnType<typeof createMetadataFromRequest>

export async function payrollProxy(
  request: NextRequest,
  errorMessage: string,
  fn: (client: PayrollClient, metadata: Meta) => Promise<unknown>
): Promise<NextResponse> {
  try {
    const response = await fn(getPayrollClient(), createMetadataFromRequest(request))
    return NextResponse.json(response as Record<string, unknown>, { status: baseHttpStatus(response) })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error(errorMessage, error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: errorMessage, validationErrors: [] } },
      { status: 500 }
    )
  }
}

/**
 * The backend answers some business errors as a gRPC OK carrying base.isSuccess=false and base.statusCode
 * (e.g. against=legacy on a LEGACY run → 400). Relay that status so the client sees an error, not an empty 200 (T030f).
 */
export function baseHttpStatus(response: unknown): number {
  const base = (response as { base?: { isSuccess?: boolean; statusCode?: string } } | null)?.base
  if (!base || base.isSuccess !== false) return 200
  const code = Number(base.statusCode)
  return code >= 400 && code <= 599 ? code : 400
}

/** Read a string search param (camelCase or snake_case fallback). */
export function qStr(sp: URLSearchParams, camel: string, snake?: string): string {
  return sp.get(camel) || (snake ? sp.get(snake) : null) || ""
}

/** Read an integer search param with a default. */
export function qInt(sp: URLSearchParams, camel: string, def = 0, snake?: string): number {
  const raw = sp.get(camel) || (snake ? sp.get(snake) : null)
  const n = Number(raw)
  return raw !== null && raw !== "" && !Number.isNaN(n) ? n : def
}

/** Parse a path parameter as a positive integer; undefined when invalid. */
export function pathInt(v: string): number | undefined {
  const n = Number(v)
  return Number.isInteger(n) && n > 0 ? n : undefined
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json(
    { base: { isSuccess: false, statusCode: "400", message, validationErrors: [] } },
    { status: 400 }
  )
}
