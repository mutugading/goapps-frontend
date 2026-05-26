import { generateMetadata as genMeta } from "@/config/site"
import CompanyMappingsPageClient from "./company-mappings-page-client"

export const metadata = genMeta("Company Mappings")

export default function CompanyMappingsPage() {
    return <CompanyMappingsPageClient />
}
