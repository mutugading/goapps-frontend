// Defensive coercion helpers for normalizers that accept BOTH camelCase and snake_case
// wire shapes. Pure functions, no runtime dependency on proto classes.

export type RawRecord = Record<string, unknown>

/** Array of records, or [] when the value is not an array. */
export function rawRecords(v: unknown): RawRecord[] {
  return Array.isArray(v) ? (v as RawRecord[]) : []
}

/** Array of strings (non-strings coerced), or [] when the value is not an array. */
export function rawStrings(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => (x === null || x === undefined ? "" : String(x))) : []
}

/** Array of finite numbers (numeric strings coerced), or [] when the value is not an array. */
export function rawNumbers(v: unknown): number[] {
  return Array.isArray(v) ? v.map((x) => toNumber(x)) : []
}

/** Empty string for null/undefined, otherwise String(v). */
export function toStringValue(v: unknown): string {
  return v === null || v === undefined ? "" : String(v)
}

/** Number coercion: numeric strings allowed, null/undefined/NaN become 0. */
export function toNumber(v: unknown): number {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

/** Boolean coercion: only true / "true" are true (anything else is false). */
export function toBoolean(v: unknown): boolean {
  return v === true || v === "true"
}
