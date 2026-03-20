import { generateMetadata as genMeta } from "@/config/site"
import MenusPageClient from "./menus-page-client"

export const metadata = genMeta("Menu Management")

export default function MenusPage() {
    return <MenusPageClient />
}
