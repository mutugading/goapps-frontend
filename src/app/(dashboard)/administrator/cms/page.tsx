import { generateMetadata as genMeta } from "@/config/site"
import CMSPageClient from "./cms-page-client"

export const metadata = genMeta("CMS Management")

export default function CMSPage() {
  return <CMSPageClient />
}
