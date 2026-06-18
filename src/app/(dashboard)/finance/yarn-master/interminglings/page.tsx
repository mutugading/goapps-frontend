import { generateMetadata as genMeta } from "@/config/site"
import InterminglingPageClient from "./intermingling-page-client"

export const metadata = genMeta("Interminglings")

export default function InterminglingPage() {
  return <InterminglingPageClient />
}
