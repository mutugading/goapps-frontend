import { generateMetadata as genMeta } from "@/config/site"
import UsersPageClient from "./users-page-client"

export const metadata = genMeta("User Management")

export default function UsersPage() {
    return <UsersPageClient />
}
