import { generateMetadata as genMeta } from "@/config/site"
import EditDashboardClient from "./edit-client"

export const metadata = genMeta("Edit Dashboard")

export default async function EditDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EditDashboardClient id={id} />
}
