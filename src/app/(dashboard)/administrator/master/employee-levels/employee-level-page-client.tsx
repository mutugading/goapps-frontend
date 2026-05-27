"use client"

import { useState, Suspense } from "react"
import { Plus, Loader2, Download, Upload } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/common/page-header"

import {
  EmployeeLevelFormDialog,
  EmployeeLevelDeleteDialog,
  EmployeeLevelFilters,
  EmployeeLevelTable,
  EmployeeLevelPagination,
  EmployeeLevelWorkflowDialog,
  EmployeeLevelImportDialog,
  type WorkflowAction,
} from "@/components/iam/employee-levels"

import {
  useEmployeeLevels,
  useExportEmployeeLevels,
  useSubmitEmployeeLevel,
  useApproveEmployeeLevel,
  useReleaseEmployeeLevel,
  useBypassReleaseEmployeeLevel,
} from "@/hooks/iam/use-employee-level"
import { useUrlState } from "@/lib/hooks"
import { usePermissionContext } from "@/providers/permission-provider"
import {
  type EmployeeLevel,
  type ListEmployeeLevelsParams,
  ActiveFilter,
  EmployeeLevelType,
  EmployeeLevelWorkflow,
} from "@/types/iam/employee-level"

const defaultFilters: ListEmployeeLevelsParams = {
  page: 1,
  pageSize: 10,
  search: "",
  activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
  type: EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_UNSPECIFIED,
  workflow: EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_UNSPECIFIED,
  sortBy: "sequence",
  sortOrder: "asc",
}

function EmployeeLevelPageContent() {
  const { hasPermission } = usePermissionContext()
  const canCreate = hasPermission("iam.master.employeelevel.create")
  const canExport = hasPermission("iam.master.employeelevel.export")
  const canImport = hasPermission("iam.master.employeelevel.import")

  const [filters, setFilters] = useUrlState<ListEmployeeLevelsParams>({
    defaultValues: defaultFilters,
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [workflowDialog, setWorkflowDialog] = useState<{
    open: boolean
    action: WorkflowAction
    entity: EmployeeLevel | null
  }>({ open: false, action: "submit", entity: null })
  const [selectedEmployeeLevel, setSelectedEmployeeLevel] =
    useState<EmployeeLevel | null>(null)

  const { data, isLoading, isError, error } = useEmployeeLevels(filters)
  const exportMutation = useExportEmployeeLevels()
  const submitMutation = useSubmitEmployeeLevel()
  const approveMutation = useApproveEmployeeLevel()
  const releaseMutation = useReleaseEmployeeLevel()
  const bypassMutation = useBypassReleaseEmployeeLevel()

  const workflowMutationMap = {
    submit: submitMutation,
    approve: approveMutation,
    release: releaseMutation,
    "bypass-release": bypassMutation,
  } as const

  const activeWorkflowMutation = workflowMutationMap[workflowDialog.action]

  const handleAddNew = () => {
    setSelectedEmployeeLevel(null)
    setIsFormOpen(true)
  }

  const handleEdit = (employeeLevel: EmployeeLevel) => {
    setSelectedEmployeeLevel(employeeLevel)
    setIsFormOpen(true)
  }

  const handleDelete = (employeeLevel: EmployeeLevel) => {
    setSelectedEmployeeLevel(employeeLevel)
    setIsDeleteOpen(true)
  }

  const openWorkflowDialog = (action: WorkflowAction) => (entity: EmployeeLevel) => {
    setWorkflowDialog({ open: true, action, entity })
  }

  const handleWorkflowConfirm = async (notes: string) => {
    if (!workflowDialog.entity) return
    try {
      await activeWorkflowMutation.mutateAsync({
        employeeLevelId: workflowDialog.entity.employeeLevelId,
        notes,
      })
      setWorkflowDialog((prev) => ({ ...prev, open: false }))
    } catch {
      // toast already shown
    }
  }

  const handleExport = async () => {
    await exportMutation.mutateAsync({
      activeFilter: filters.activeFilter,
      type: filters.type,
      workflow: filters.workflow,
    })
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }))
  }

  const totalItems = data?.pagination?.totalItems ?? 0

  return (
    <div>
      <PageHeader
        title="Employee Levels"
        subtitle="Manage employee grade levels, types, and workflow states"
      >
        <div className="flex items-center gap-2">
          {(canExport || canImport) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {exportMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Export/Import
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canExport && (
                  <DropdownMenuItem
                    onClick={handleExport}
                    disabled={exportMutation.isPending}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export to Excel
                  </DropdownMenuItem>
                )}
                {canImport && (
                  <DropdownMenuItem onClick={() => setIsImportOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import from Excel
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {canCreate && (
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee Level
            </Button>
          )}
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Employee Level List</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${totalItems} total employee levels`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EmployeeLevelFilters filters={filters} onFiltersChange={setFilters} />

          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load employee levels"}
            </div>
          )}

          <EmployeeLevelTable
            data={data?.data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSubmit={openWorkflowDialog("submit")}
            onApprove={openWorkflowDialog("approve")}
            onRelease={openWorkflowDialog("release")}
            onBypassRelease={openWorkflowDialog("bypass-release")}
          />

          <EmployeeLevelPagination
            pagination={data?.pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      <EmployeeLevelFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        employeeLevel={selectedEmployeeLevel}
      />

      <EmployeeLevelDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        employeeLevel={selectedEmployeeLevel}
      />

      <EmployeeLevelImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
      />

      {workflowDialog.entity && (
        <EmployeeLevelWorkflowDialog
          open={workflowDialog.open}
          onOpenChange={(open) => setWorkflowDialog((prev) => ({ ...prev, open }))}
          action={workflowDialog.action}
          entityCode={workflowDialog.entity.code}
          entityName={workflowDialog.entity.name}
          isLoading={activeWorkflowMutation.isPending}
          onConfirm={handleWorkflowConfirm}
        />
      )}
    </div>
  )
}

function EmployeeLevelPageSkeleton() {
  return (
    <div>
      <PageHeader
        title="Employee Levels"
        subtitle="Manage employee grade levels, types, and workflow states"
      >
        <div className="flex items-center gap-2">
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee Level
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Employee Level List</CardTitle>
          <CardDescription>Loading...</CardDescription>
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

export default function EmployeeLevelPageClient() {
  return (
    <Suspense fallback={<EmployeeLevelPageSkeleton />}>
      <EmployeeLevelPageContent />
    </Suspense>
  )
}
