import { generateMetadata as genMeta } from "@/config/site"
import RolesPageClient from "./roles-page-client"

export const metadata = genMeta("Roles & Permissions")

export default function RolesPage() {
    return <RolesPageClient />
}
