// FE number formatting — mirrors backend domain/bi/chart/number_format.go so axis
// ticks and labels rendered client-side match server-formatted labels.

export type NumberFormat =
  | "raw"
  | "thousands"
  | "millions"
  | "percent"
  | "currency_thousands"
  | "currency_millions"

/** Format a numeric value per the format key. Negatives use accounting brackets. */
export function formatNumber(value: number, fmt: NumberFormat | string, decimals = 1): string {
  const d = Math.max(0, Math.min(6, decimals))
  const abs = Math.abs(value)
  const negative = value < 0

  let body: string
  switch (fmt) {
    case "raw":
      body = withCommas(abs, d)
      break
    case "thousands":
      body = withCommas(abs / 1e3, d) + "K"
      break
    case "millions":
      body = withCommas(abs / 1e6, d) + "M"
      break
    case "percent":
      body = withCommas(abs * 100, d) + "%"
      break
    case "currency_thousands":
      body = "$" + withCommas(abs / 1e3, d) + "K"
      break
    case "currency_millions":
      body = "$" + withCommas(abs / 1e6, d) + "M"
      break
    default:
      body = withCommas(abs, d)
  }
  return negative ? `(${body})` : body
}

/** Render a non-negative number with thousands separators. */
function withCommas(v: number, decimals: number): string {
  const fixed = v.toFixed(decimals)
  const [intPart, frac] = fixed.split(".")
  const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return frac ? `${withComma}.${frac}` : withComma
}
