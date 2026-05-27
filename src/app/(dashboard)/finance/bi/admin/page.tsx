import { generateMetadata as genMeta } from "@/config/site"
import BiAdminClient from "./admin-client"

export const metadata = genMeta("Dashboard Administration")

export default function BiAdminPage() {
  return <BiAdminClient />
}
