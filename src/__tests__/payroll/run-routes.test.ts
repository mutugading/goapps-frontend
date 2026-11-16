// Payroll run & period BFF routes (T030a): forwarding, gRPC error mapping (409 PERIOD_*, 403), validation.
import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import * as grpc from "@grpc/grpc-js"

const listRuns = vi.fn()
const createRun = vi.fn()
const getRun = vi.fn()
const listRunLines = vi.fn()
const listPeriods = vi.fn()
const getRunDiff = vi.fn()
const approvePeriod = vi.fn()
const closePeriod = vi.fn()
const reopenPeriod = vi.fn()

vi.mock("@/lib/grpc", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/grpc")>()
  return {
    ...actual,
    createMetadataFromRequest: () => ({ metadata: true }),
    getPayrollClient: () => ({
      listRuns, createRun, getRun, getRunDiff, listRunLines, listPeriods, approvePeriod, closePeriod, reopenPeriod,
    }),
  }
})

import { GET as listRunsRoute, POST as createRunRoute } from "@/app/api/v1/payroll/runs/route"
import { GET as getRunRoute } from "@/app/api/v1/payroll/runs/[id]/route"
import { GET as diffRoute } from "@/app/api/v1/payroll/runs/[id]/diff/route"
import { GET as linesRoute } from "@/app/api/v1/payroll/runs/[id]/lines/route"
import { GET as periodsRoute } from "@/app/api/v1/payroll/periods/route"
import { POST as actionRoute } from "@/app/api/v1/payroll/periods/[yymm]/[division]/[action]/route"

const BASE = "http://localhost:3000/api/v1/payroll"
const OK = { isSuccess: true, statusCode: "200", message: "OK", validationErrors: [] }
const grpcError = (code: number, details: string) =>
  Object.assign(new Error(details), { code, details, metadata: new grpc.Metadata() }) as grpc.ServiceError
const ctx = <T extends Record<string, string>>(p: T) => ({ params: Promise.resolve(p) })

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("payroll run routes", () => {
  it("lists runs forwarding filters", async () => {
    listRuns.mockResolvedValue({ base: OK, data: [{ runId: 1 }] })
    const res = await listRunsRoute(new NextRequest(`${BASE}/runs?yymm=202701&division=SOLO`))
    expect(res.status).toBe(200)
    expect(listRuns.mock.calls[0][0]).toEqual({ yymm: 202701, division: "SOLO" })
    expect((await res.json()).data).toEqual([{ runId: 1 }])
  })

  it("gets a run by id and rejects a bad id", async () => {
    getRun.mockResolvedValue({ base: OK, data: { runId: 7 } })
    const ok = await getRunRoute(new NextRequest(`${BASE}/runs/7`), ctx({ id: "7" }))
    expect(ok.status).toBe(200)
    expect(getRun.mock.calls[0][0]).toEqual({ runId: 7 })
    const bad = await getRunRoute(new NextRequest(`${BASE}/runs/x`), ctx({ id: "x" }))
    expect(bad.status).toBe(400)
    expect(getRun).toHaveBeenCalledTimes(1)
  })

  it("maps 403 and 404 from gRPC on get run", async () => {
    getRun.mockRejectedValueOnce(grpcError(grpc.status.PERMISSION_DENIED, "division forbidden"))
    expect((await getRunRoute(new NextRequest(`${BASE}/runs/7`), ctx({ id: "7" }))).status).toBe(403)
    getRun.mockRejectedValueOnce(grpcError(grpc.status.NOT_FOUND, "missing"))
    expect((await getRunRoute(new NextRequest(`${BASE}/runs/7`), ctx({ id: "7" }))).status).toBe(404)
  })

  it("relays base.statusCode of a business error answered as gRPC OK (T030f)", async () => {
    const base = { isSuccess: false, statusCode: "400", message: "against=legacy hanya untuk run ENGINE", validationErrors: [] }
    getRunDiff.mockResolvedValueOnce({ base })
    const res = await diffRoute(new NextRequest(`${BASE}/runs/182/diff?against=legacy`), ctx({ id: "182" }))
    expect(res.status).toBe(400)
    expect((await res.json()).base.message).toContain("hanya untuk run ENGINE")
    getRunDiff.mockResolvedValueOnce({ base: OK, data: { runId: 9 } })
    expect((await diffRoute(new NextRequest(`${BASE}/runs/9/diff`), ctx({ id: "9" }))).status).toBe(200)
  })

  it("lists run lines with pagination params and passes pagination through", async () => {
    const pagination = { currentPage: 2, pageSize: 50, totalItems: "120", totalPages: 3 }
    listRunLines.mockResolvedValue({ base: OK, data: [], pagination })
    const res = await linesRoute(
      new NextRequest(`${BASE}/runs/7/lines?nik=123&page=2&page_size=50`),
      ctx({ id: "7" })
    )
    expect(listRunLines.mock.calls[0][0]).toEqual({ runId: 7, nik: "123", page: 2, pageSize: 50 })
    expect((await res.json()).pagination).toEqual(pagination)
  })

  it("lists periods", async () => {
    listPeriods.mockResolvedValue({ base: OK, data: [{ yymm: 202701 }] })
    const res = await periodsRoute(new NextRequest(`${BASE}/periods?division=JAKARTA`))
    expect(res.status).toBe(200)
    expect(listPeriods.mock.calls[0][0]).toEqual({ division: "JAKARTA" })
  })
})

describe("payroll period action route", () => {
  const post = (action: string, body?: unknown) =>
    actionRoute(
      new NextRequest(`${BASE}/periods/202701/SOLO/${action}`, {
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      ctx({ yymm: "202701", division: "SOLO", action })
    )

  it("approves and closes", async () => {
    approvePeriod.mockResolvedValue({ base: OK, data: { status: "APPROVED" } })
    closePeriod.mockResolvedValue({ base: OK, data: { status: "CLOSED" } })
    expect((await post("approve")).status).toBe(200)
    expect(approvePeriod.mock.calls[0][0]).toEqual({ yymm: 202701, division: "SOLO" })
    expect((await post("close")).status).toBe(200)
    expect(closePeriod.mock.calls[0][0]).toEqual({ yymm: 202701, division: "SOLO" })
  })

  it("reopens with the reason from the body", async () => {
    reopenPeriod.mockResolvedValue({ base: OK, data: { status: "OPEN" } })
    const res = await post("reopen", { reason: "koreksi tunjangan shift" })
    expect(res.status).toBe(200)
    expect(reopenPeriod.mock.calls[0][0]).toEqual({
      yymm: 202701, division: "SOLO", reason: "koreksi tunjangan shift",
    })
  })

  it("maps PERIOD_CLOSED / PERIOD_APPROVED (AlreadyExists) to 409", async () => {
    approvePeriod.mockRejectedValue(grpcError(grpc.status.ALREADY_EXISTS, "PERIOD_CLOSED"))
    const res = await post("approve")
    expect(res.status).toBe(409)
    expect((await res.json()).base.isSuccess).toBe(false)
  })

  it("maps permission denied to 403", async () => {
    closePeriod.mockRejectedValue(grpcError(grpc.status.PERMISSION_DENIED, "denied"))
    expect((await post("close")).status).toBe(403)
  })

  it("rejects unknown action and invalid yymm without calling gRPC", async () => {
    expect((await post("delete")).status).toBe(400)
    const bad = await actionRoute(
      new NextRequest(`${BASE}/periods/abc/SOLO/approve`, { method: "POST" }),
      ctx({ yymm: "abc", division: "SOLO", action: "approve" })
    )
    expect(bad.status).toBe(400)
    expect(approvePeriod).not.toHaveBeenCalled()
  })

  it("returns 500 for non-gRPC errors", async () => {
    approvePeriod.mockRejectedValue(new Error("boom"))
    expect((await post("approve")).status).toBe(500)
  })
})

// T031b: POST /runs is dry only (D-71): mode and companyId are forced by the BFF.
describe("POST /runs (dry run)", () => {
  const dry = (body: unknown) =>
    createRunRoute(
      new NextRequest(`${BASE}/runs`, {
        method: "POST",
        body: typeof body === "string" ? body : JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      })
    )

  it("forces mode=DRY and companyId=0 even when the client sends commit", async () => {
    createRun.mockResolvedValue({ base: OK, data: { runId: 0 }, employees: [{ nik: "1" }] })
    const res = await dry({ yymm: 202611, division: "SOLO", nik: [" 123 ", ""], mode: "RUN_MODE_COMMIT", companyId: 9, processDate: "2026-11-30" })
    expect(res.status).toBe(200)
    expect(createRun.mock.calls[0][0]).toEqual({
      yymm: 202611, division: "SOLO", companyId: 0, processDate: "", mode: 1, nik: ["123"],
    })
    expect((await res.json()).employees).toEqual([{ nik: "1" }])
  })

  it("sends an empty nik list when omitted", async () => {
    createRun.mockResolvedValue({ base: OK })
    await dry({ yymm: 202611, division: "SOLO" })
    expect(createRun.mock.calls[0][0].nik).toEqual([])
  })

  it("rejects bad input without calling gRPC", async () => {
    expect((await dry("{not json")).status).toBe(400)
    expect((await dry({ yymm: "x", division: "SOLO" })).status).toBe(400)
    expect((await dry({ yymm: 202611, division: " " })).status).toBe(400)
    expect((await dry({ yymm: 202611, division: "SOLO", nik: "1" })).status).toBe(400)
    expect((await dry({ yymm: 202611, division: "SOLO", nik: Array.from({ length: 501 }, (_, i) => String(i + 1)) })).status).toBe(400)
    expect(createRun).not.toHaveBeenCalled()
  })

  it("relays business errors (base.statusCode) and gRPC errors", async () => {
    createRun.mockResolvedValueOnce({ base: { isSuccess: false, statusCode: "422", message: "MISSING_ATTENDANCE", validationErrors: [] } })
    const biz = await dry({ yymm: 202611, division: "SOLO" })
    expect(biz.status).toBe(422)
    expect((await biz.json()).base.message).toBe("MISSING_ATTENDANCE")
    createRun.mockRejectedValueOnce(grpcError(grpc.status.ALREADY_EXISTS, "PERIOD_CLOSED"))
    expect((await dry({ yymm: 202611, division: "SOLO" })).status).toBe(409)
    createRun.mockRejectedValueOnce(grpcError(grpc.status.PERMISSION_DENIED, "denied"))
    expect((await dry({ yymm: 202611, division: "SOLO" })).status).toBe(403)
  })
})
