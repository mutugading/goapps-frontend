import { generateMetadata as genMeta } from "@/config/site"
import FormulaPageClient from "./formula-page-client"

export const metadata = genMeta("Formulas")

export default function FormulaPage() {
  return <FormulaPageClient />
}
