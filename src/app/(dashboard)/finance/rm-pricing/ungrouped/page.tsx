import { generateMetadata as genMeta } from "@/config/site"
import UngroupedPageClient from "./ungrouped-page-client"

export const metadata = genMeta("Ungrouped Items")

export default function UngroupedPage() {
  return <UngroupedPageClient />
}
