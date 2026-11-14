// Display helpers for payroll run & period screens (T030b).
// Money is a decimal string (never float). The backend sends the literal "***" when the
// caller lacks payroll.salary.amount.view; it is shown as-is.

export const MASKED = "***"

/** Groups the integer part of a decimal string with "." (id-ID style); never converts to number. */
export function formatNominal(value: string | undefined | null): string {
  if (value === undefined || value === null || value === "") return "-"
  if (value === MASKED) return MASKED
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(value.trim())
  if (!m) return value
  const [, sign, int, frac] = m
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${sign}${grouped}${frac ? `,${frac}` : ""}`
}

/** 202701 -> "2027-01". */
export function formatYymm(yymm: number): string {
  const s = String(yymm)
  return s.length === 6 ? `${s.slice(0, 4)}-${s.slice(4)}` : s
}

/** Parses a filter input like "202701" or "2027-01"; returns undefined when not a valid yyyymm. */
export function parseYymm(input: string): number | undefined {
  const digits = input.replace(/\D/g, "")
  if (digits.length !== 6) return undefined
  const month = Number(digits.slice(4))
  if (month < 1 || month > 12) return undefined
  return Number(digits)
}

export type StatusVariant = "default" | "secondary" | "destructive" | "outline"

export function runStatusVariant(status: string): StatusVariant {
  switch (status) {
    case "ACTIVE":
      return "default"
    case "FAILED":
      return "destructive"
    case "SUPERSEDED":
      return "secondary"
    default:
      return "outline"
  }
}

export function periodStatusVariant(status: string): StatusVariant {
  switch (status) {
    case "CLOSED":
      return "default"
    case "APPROVED":
      return "secondary"
    default:
      return "outline"
  }
}

export const RUN_STATUSES = ["ACTIVE", "SUPERSEDED", "DRY", "FAILED"] as const
export const PAYROLL_DIVISIONS = ["SOLO", "JAKARTA"] as const

export const MIN_REOPEN_REASON = 10

export const PERM_PERIOD_APPROVE = "payroll.period.salary.approve"
export const PERM_PERIOD_CLOSE = "payroll.period.salary.close"
export const PERM_PERIOD_REOPEN = "payroll.period.salary.reopen"
