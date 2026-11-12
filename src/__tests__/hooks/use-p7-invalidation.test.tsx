import { describe, it, expect, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { useRelinkCostProductMb } from "@/hooks/finance/use-cost-product-master"
import { useValidateMBHead } from "@/hooks/finance/use-mb-head"
import { useUnsupersedeMBSpin } from "@/hooks/finance/use-mb-spin"

function setup(body: unknown) {
  const qc = new QueryClient()
  const spy = vi.spyOn(qc, "invalidateQueries")
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body }) as never
  return { spy, wrapper }
}
const CPP = { queryKey: ["finance", "cost-product-parameter"] }

describe("P7-R5 parameter cache invalidation", () => {
  it("relink invalidates cost-product-parameter", async () => {
    const { spy, wrapper } = setup({ base: { isSuccess: true }, data: {} })
    const { result } = renderHook(() => useRelinkCostProductMb(), { wrapper })
    result.current.mutate(1)
    await waitFor(() => expect(spy).toHaveBeenCalledWith(CPP))
  })

  it("unsupersede invalidates mb-spin, mb-head and cost-product-parameter", async () => {
    const { spy, wrapper } = setup({ base: { isSuccess: true }, data: {}, paramsReverted: 0, skipped: [] })
    const { result } = renderHook(() => useUnsupersedeMBSpin(), { wrapper })
    result.current.mutate({ mbsId: "s1", mbhId: "h1" })
    await waitFor(() => expect(spy).toHaveBeenCalledWith(CPP))
    expect(spy).toHaveBeenCalledWith({ queryKey: ["finance", "mb-spin"] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["finance", "mb-head"] })
  })

  it("validate with confirmSupersede invalidates mb-spin and parameters; plain validate does not", async () => {
    const a = setup({ base: { isSuccess: true }, data: {} })
    const r1 = renderHook(() => useValidateMBHead(), { wrapper: a.wrapper })
    r1.result.current.mutate({ mbhId: "h1", confirmSupersede: true })
    await waitFor(() => expect(a.spy).toHaveBeenCalledWith(CPP))
    expect(a.spy).toHaveBeenCalledWith({ queryKey: ["finance", "mb-spin"] })

    const b = setup({ base: { isSuccess: true }, data: {} })
    const r2 = renderHook(() => useValidateMBHead(), { wrapper: b.wrapper })
    r2.result.current.mutate("h1")
    await waitFor(() => expect(r2.result.current.isSuccess).toBe(true))
    expect(b.spy).not.toHaveBeenCalledWith(CPP)
  })
})
