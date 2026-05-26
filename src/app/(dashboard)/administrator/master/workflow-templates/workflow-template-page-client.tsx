"use client"

import { Suspense, useState } from "react"
import { Loader2, Plus } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { ConfirmDialog } from "@/components/shared"

import {
  WorkflowTemplateFormDialog,
  WorkflowTemplateTable,
} from "@/components/iam/workflow-template"

import {
  type ListWorkflowTemplatesParams,
  useActivateWorkflowTemplate,
  useDeleteWorkflowTemplate,
  useWorkflowTemplates,
} from "@/hooks/iam/use-workflow-template"
import { useUrlState } from "@/lib/hooks"
import type { WorkflowTemplate } from "@/types/iam/workflow"

const defaultFilters: ListWorkflowTemplatesParams = {
  page: 1,
  pageSize: 20,
  search: "",
  kind: "",
  activeFilter: "all",
  sortBy: "kind",
  sortOrder: "asc",
}

function WorkflowTemplatePageContent() {
  const [filters] = useUrlState<ListWorkflowTemplatesParams>({
    defaultValues: defaultFilters,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)
  const [selected, setSelected] = useState<WorkflowTemplate | null>(null)

  const { data, isLoading, isError, error } = useWorkflowTemplates(filters)
  const activateMut = useActivateWorkflowTemplate()
  const deleteMut = useDeleteWorkflowTemplate()

  const handleAddNew = () => {
    setSelected(null)
    setFormOpen(true)
  }
  const handleEdit = (t: WorkflowTemplate) => {
    setSelected(t)
    setFormOpen(true)
  }
  const handleDelete = (t: WorkflowTemplate) => {
    setSelected(t)
    setDeleteOpen(true)
  }
  const handleActivate = (t: WorkflowTemplate) => {
    setSelected(t)
    setActivateOpen(true)
  }

  const total = data?.pagination?.totalItems ?? 0

  return (
    <div>
      <PageHeader
        title="Workflow Templates"
        subtitle="Configure multi-step approval workflows for product costing and parameter filling. Update creates a new version; activate the new version to use it."
      >
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>
            {isLoading ? "Loading…" : `${total} total template version(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              {error instanceof Error ? error.message : "Failed to load workflow templates"}
            </div>
          )}

          <WorkflowTemplateTable
            data={data?.data ?? []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onActivate={handleActivate}
          />
        </CardContent>
      </Card>

      <WorkflowTemplateFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        template={selected}
      />

      <ConfirmDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
        title="Activate this version?"
        description={
          selected
            ? `Activating "${selected.name}" (v${selected.version}) will deactivate every other version of kind "${selected.kind}". New workflow instances will use this version going forward; in-flight instances keep their snapshot.`
            : ""
        }
        confirmText="Activate"
        isLoading={activateMut.isPending}
        onConfirm={async () => {
          if (!selected) return
          try {
            await activateMut.mutateAsync(selected.templateId)
            setActivateOpen(false)
          } catch {
            /* toast handled */
          }
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this template version?"
        description={
          selected
            ? `This soft-deletes "${selected.name}" (v${selected.version}). Running workflow instances are unaffected because they hold a snapshot.`
            : ""
        }
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteMut.isPending}
        onConfirm={async () => {
          if (!selected) return
          try {
            await deleteMut.mutateAsync(selected.templateId)
            setDeleteOpen(false)
          } catch {
            /* toast handled */
          }
        }}
      />
    </div>
  )
}

function PageSkeleton() {
  return (
    <div>
      <PageHeader title="Workflow Templates" subtitle="Loading…">
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function WorkflowTemplatePageClient() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WorkflowTemplatePageContent />
    </Suspense>
  )
}
