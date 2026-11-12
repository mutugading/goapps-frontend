import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

import { SupersedeConfirmationRequiredError } from "@/services/finance/mb-head-api"

const approveMutate = vi.fn((_id: string, opts?: { onError?: (e: Error) => void }) => {
  opts?.onError?.(new SupersedeConfirmationRequiredError("m1", "SUPERSEDE_CONFIRMATION_REQUIRED: x"))
})

vi.mock("@/hooks/finance/use-mb-head", () => {
  const stub = () => ({ mutate: vi.fn(), isPending: false })
  return {
    useSubmitMBHead: stub,
    useApproveMBHead: () => ({ mutate: approveMutate, isPending: false }),
    useRejectMBHead: stub,
    useReturnMBHeadToDraft: stub,
    useUnrevokeMBHead: stub,
    useRequestUnlockMBHead: stub,
    useGrantUnlockMBHead: stub,
    useRejectUnlockMBHead: stub,
    useMBHeadSupersedePreview: () => ({ data: { requiresConfirmation: true, candidates: [] }, isLoading: false, isError: false }),
    useValidateMBHead: stub,
  }
})
vi.mock("@/providers/permission-provider", () => ({
  usePermissionContext: () => ({ hasPermission: () => true }),
}))

import { MbRecipeActionBar } from "@/components/finance/mb-recipe/mb-recipe-action-bar"
import type { MBHead } from "@/types/finance/mb-head"

describe("MbRecipeActionBar — supersede gate", () => {
  it("opens the supersede dialog when Approve returns the 409 gate", () => {
    const mbHead = { mbhId: "m1", entryStatus: "SUBMITTED" } as unknown as MBHead
    render(<MbRecipeActionBar mbHead={mbHead} />)
    expect(screen.queryByText(/replace existing mb spin/i)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /^approve$/i }))
    expect(screen.getByText(/replace existing mb spin/i)).toBeInTheDocument()
  })
})
