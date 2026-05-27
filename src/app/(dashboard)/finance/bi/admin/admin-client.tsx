"use client"

// BI Admin panel — tabbed: Dashboards | Groups | ETL Jobs | Audit.

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/common/page-header"
import { DashboardList } from "@/components/bi/admin/dashboard-list"
import { GroupManagement } from "@/components/bi/admin/group-management"
import { JobMonitor } from "@/components/bi/admin/job-monitor"
import { AuditLog } from "@/components/bi/admin/audit-log"

export default function BiAdminClient() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Administration" subtitle="Manage dashboards, groups, ETL jobs, and audit" />
      <Tabs defaultValue="dashboards">
        <TabsList>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="jobs">ETL Jobs</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboards" className="mt-4">
          <DashboardList />
        </TabsContent>
        <TabsContent value="groups" className="mt-4">
          <GroupManagement />
        </TabsContent>
        <TabsContent value="jobs" className="mt-4">
          <JobMonitor />
        </TabsContent>
        <TabsContent value="audit" className="mt-4">
          <AuditLog />
        </TabsContent>
      </Tabs>
    </div>
  )
}
