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
  EmployeeGroupFormDialog,
  EmployeeGroupDeleteDialog,
  EmployeeGroupFilters,
  EmployeeGroupTable,
  EmployeeGroupPagination,
  EmployeeGroupImportDialog,
} from "@/components/iam/employee-groups"

import {
  useEmployeeGroups,
  useExportEmployeeGroups,
} from "@/hooks/iam/use-employee-group"
import { useUrlState } from "@/lib/hooks"
import { usePermissionContext } from "@/providers/permission-provider"
import {
  type EmployeeGroup,
  type ListEmployeeGroupsParams,
  ActiveFilter,
} from "@/types/iam/employee-group"

const defaultFilters: ListEmployeeGroupsParams = {
  page: 1,
  pageSize: 10,
  search: "",
  activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
  sortBy: "code",
  sortOrder: "asc",
}

function EmployeeGroupPageContent() {
  const { hasPermission } = usePermissionContext()
  const canCreate = hasPermission("iam.master.employeegroup.create")
  const canExport = hasPermission("iam.master.employeegroup.export")
  const canImport = hasPermission("iam.master.employeegroup.import")

  const [filters, setFilters] = useUrlState<ListEmployeeGroupsParams>({
    defaultValues: defaultFilters,
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedEmployeeGroup, setSelectedEmployeeGroup] =
    useState<EmployeeGroup | null>(null)

  const { data, isLoading, isError, error } = useEmployeeGroups(filters)
  const exportMutation = useExportEmployeeGroups()

  const handleAddNew = () => {
    setSelectedEmployeeGroup(null)
    setIsFormOpen(true)
  }

  const handleEdit = (employeeGroup: EmployeeGroup) => {
    setSelectedEmployeeGroup(employeeGroup)
    setIsFormOpen(true)
  }

  const handleDelete = (employeeGroup: EmployeeGroup) => {
    setSelectedEmployeeGroup(employeeGroup)
    setIsDeleteOpen(true)
  }

  const handleExport = async () => {
    await exportMutation.mutateAsync({
      activeFilter: filters.activeFilter,
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
        title="Employee Groups"
        subtitle="Manage employee group / department categories"
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
              Add Employee Group
            </Button>
          )}
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Employee Group List</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${totalItems} total employee groups`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EmployeeGroupFilters filters={filters} onFiltersChange={setFilters} />

          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load employee groups"}
            </div>
          )}

          <EmployeeGroupTable
            data={data?.data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <EmployeeGroupPagination
            pagination={data?.pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      <EmployeeGroupFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        employeeGroup={selectedEmployeeGroup}
      />

      <EmployeeGroupDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        employeeGroup={selectedEmployeeGroup}
      />

      <EmployeeGroupImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
      />
    </div>
  )
}

function EmployeeGroupPageSkeleton() {
  return (
    <div>
      <PageHeader
        title="Employee Groups"
        subtitle="Manage employee group / department categories"
      >
        <div className="flex items-center gap-2">
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee Group
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Employee Group List</CardTitle>
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

export default function EmployeeGroupPageClient() {
  return (
    <Suspense fallback={<EmployeeGroupPageSkeleton />}>
      <EmployeeGroupPageContent />
    </Suspense>
  )
}
