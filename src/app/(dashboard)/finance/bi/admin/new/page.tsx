import { generateMetadata as genMeta } from "@/config/site"
import { PageHeader } from "@/components/common/page-header"
import { DashboardWizard } from "@/components/bi/admin/wizard/dashboard-wizard"

export const metadata = genMeta("New Dashboard")

export default function NewDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Dashboard" subtitle="Configure a dashboard without writing code" />
      <DashboardWizard mode="create" />
    </div>
  )
}
