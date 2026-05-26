"use client"

import { Plus } from "lucide-react"
import { useState } from "react"

import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTablePagination } from "@/components/shared"
import { RuleFormDialog, RuleTable } from "@/components/finance/cost-routing-rule"
import { useDeleteRoutingRule, useRoutingRules } from "@/hooks/finance/use-cost-routing-rule"
import { useUrlState } from "@/lib/hooks"
import type { CostRoutingRule, ListCostRoutingRulesParams } from "@/types/finance/cost-routing-rule"

const defaultFilters: ListCostRoutingRulesParams = { activeFilter: "", page: 1, pageSize: 50 }

export default function RoutingRulesPageClient() {
  const [filters, setFilters] = useUrlState<ListCostRoutingRulesParams>({ defaultValues: defaultFilters })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CostRoutingRule | null>(null)

  const { data, isLoading } = useRoutingRules(filters)
  const items = data?.items ?? []
  const pagination = data?.pagination
  const totalItems = Number(pagination?.totalItems ?? 0)
  const deleteM = useDeleteRoutingRule()

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(r: CostRoutingRule) {
    setEditing(r)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Routing Rules"
        subtitle="First-match-wins rules evaluated on cost_product_request submit (FR-3 hybrid routing)."
      >
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New rule
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          value={filters.activeFilter || "all"}
          onValueChange={(v) =>
            setFilters({
              ...filters,
              activeFilter: v === "all" ? "" : (v as "active" | "inactive"),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="inactive">Inactive only</SelectItem>
          </SelectContent>
        </Select>
        <div />
      </div>

      <RuleTable
        items={items}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={(r) => {
          if (confirm(`Delete rule #${r.ruleId} (priority ${r.priority})?`)) {
            deleteM.mutate(r.ruleId)
          }
        }}
      />

      {totalItems > 0 && (
        <DataTablePagination
          currentPage={Number(pagination?.currentPage ?? 1)}
          pageSize={Number(pagination?.pageSize ?? 50)}
          totalItems={totalItems}
          totalPages={Number(pagination?.totalPages ?? 0)}
          onPageChange={(page) => setFilters({ ...filters, page })}
          onPageSizeChange={(pageSize) => setFilters({ ...filters, pageSize, page: 1 })}
        />
      )}

      <RuleFormDialog open={formOpen} onOpenChange={setFormOpen} rule={editing} />
    </div>
  )
}
