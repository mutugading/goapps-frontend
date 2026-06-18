import { generateMetadata as genMeta } from "@/config/site"
import MBSpinPageClient from "./mb-spin-page-client"

export const metadata = genMeta("MB Spins")

export default function MBSpinPage() {
  return <MBSpinPageClient />
}
