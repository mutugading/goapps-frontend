import { generateMetadata as genMeta } from "@/config/site"
import MBHeadPageClient from "./mb-head-page-client"

export const metadata = genMeta("MB Heads")

export default function MBHeadPage() {
  return <MBHeadPageClient />
}
