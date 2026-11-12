// HTTP status for NEW P7 BFF routes only. Maps a backend `base` failure to the HTTP status
// carried in base.statusCode (4xx/5xx). Existing routes keep returning HTTP 200 with the
// failure inside `base`, so this helper is deliberately NOT used by them.
export function httpStatusFromBase(base: { isSuccess?: boolean; statusCode?: string } | undefined): number {
  if (base?.isSuccess !== false) return 200
  const code = Number(base?.statusCode)
  return Number.isInteger(code) && code >= 400 && code <= 599 ? code : 400
}
