import { generateMetadata as genMeta } from "@/config/site"
import UomPageClient from "./uom-page-client"

export const metadata = genMeta("Unit of Measure")

export default function UOMPage() {
  return <UomPageClient />
}
