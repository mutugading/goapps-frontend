// Shared formatting helpers for cost-results UI.

export function formatNumeric(s: string | number | null | undefined): string {
  if (s == null || s === "") return "—"
  const n = typeof s === "number" ? s : Number(s)
  if (!Number.isFinite(n)) return String(s)
  return n.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}

export function formatDate(s: string | null | undefined): string {
  if (!s) return "—"
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleString()
}
