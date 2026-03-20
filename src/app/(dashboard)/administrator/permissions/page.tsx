import { generateMetadata as genMeta } from "@/config/site"
import PermissionsPageClient from "./permissions-page-client"

export const metadata = genMeta("Permission Management")

export default function PermissionsPage() {
    return <PermissionsPageClient />
}
