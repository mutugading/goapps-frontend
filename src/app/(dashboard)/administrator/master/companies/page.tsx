import { generateMetadata as genMeta } from "@/config/site"
import CompaniesPageClient from "./companies-page-client"

export const metadata = genMeta("Companies")

export default function CompaniesPage() {
    return <CompaniesPageClient />
}
