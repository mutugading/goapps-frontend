"use client"

import { useState, Suspense } from "react"
import { Plus, Download, Upload, Loader2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  ParameterFormDialog,
  ParameterDeleteDialog,
  ParameterImportDialog,
  ParameterFilters,
  ParameterTable,
  ParameterPagination,
} from "@/components/finance/parameter"

import { useParameters, useExportParameters } from "@/hooks/finance/use-parameter"
import { useUrlState } from "@/lib/hooks"
import {
  type Parameter,
  type ListParametersParams,
  ActiveFilter,
  DataType,
  ParamCategory,
} from "@/types/finance/parameter"

const defaultFilters: ListParametersParams = {
  page: 1,
  pageSize: 10,
  search: "",
  dataType: DataType.DATA_TYPE_UNSPECIFIED,
  paramCategory: ParamCategory.PARAM_CATEGORY_UNSPECIFIED,
  activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
  sortBy: "code",
  sortOrder: "asc",
}

function ParameterPageContent() {
  const [filters, setFilters] = useUrlState<ListParametersParams>({
    defaultValues: defaultFilters,
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null)

  const { data, isLoading, isError, error } = useParameters(filters)
  const exportMutation = useExportParameters()

  const handleAddNew = () => {
    setSelectedParameter(null)
    setIsFormOpen(true)
  }

  const handleEdit = (parameter: Parameter) => {
    setSelectedParameter(parameter)
    setIsFormOpen(true)
  }

  const handleDelete = (parameter: Parameter) => {
    setSelectedParameter(parameter)
    setIsDeleteOpen(true)
  }

  const handleExport = async () => {
    await exportMutation.mutateAsync({
      dataType: filters.dataType,
      paramCategory: filters.paramCategory,
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
        title="Parameters"
        subtitle="Manage parameters for costing calculations"
      >
        <div className="flex items-center gap-2">
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
              <DropdownMenuItem
                onClick={handleExport}
                disabled={exportMutation.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import from Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Parameter
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Parameter List</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : `${totalItems} total parameters`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ParameterFilters filters={filters} onFiltersChange={setFilters} />

          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load parameters"}
            </div>
          )}

          <ParameterTable
            data={data?.data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <ParameterPagination
            pagination={data?.pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      <ParameterFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        parameter={selectedParameter}
      />

      <ParameterDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        parameter={selectedParameter}
      />

      <ParameterImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
    </div>
  )
}

function ParameterPageSkeleton() {
  return (
    <div>
      <PageHeader
        title="Parameters"
        subtitle="Manage parameters for costing calculations"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export/Import
          </Button>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Parameter
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Parameter List</CardTitle>
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

export default function ParameterPageClient() {
  return (
    <Suspense fallback={<ParameterPageSkeleton />}>
      <ParameterPageContent />
    </Suspense>
  )
}
