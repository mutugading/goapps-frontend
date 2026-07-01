import { generateMetadata as genMeta } from "@/config/site"
import PermissionCatalogClient from "./permission-catalog-client"

export const metadata = genMeta("Permission Catalog")

export default function PermissionCatalogPage() {
    return <PermissionCatalogClient />
}
