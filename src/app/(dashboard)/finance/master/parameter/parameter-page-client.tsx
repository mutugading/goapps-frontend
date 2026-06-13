"use client"

import { useState, Suspense } from "react"
import { Plus, Loader2 } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

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
  ParameterFormDialog,
  ParameterDeleteDialog,
  ParameterFilters,
  ParameterTable,
  ParameterPagination,
} from "@/components/finance/parameter"

import { useParameters, parameterKeys } from "@/hooks/finance/use-parameter"
import { ImportExportToolbar } from "@/components/finance/costing/import-export-toolbar"
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
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null)

  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useParameters(filters)

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
          <ImportExportToolbar
            entity="parameter"
            onImportSuccess={() =>
              queryClient.invalidateQueries({ queryKey: parameterKeys.lists() })
            }
          />
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
          <Button variant="outline" size="sm" disabled>Template</Button>
          <Button variant="outline" size="sm" disabled>Export</Button>
          <Button variant="outline" size="sm" disabled>Import</Button>
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
