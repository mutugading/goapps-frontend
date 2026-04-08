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
  FormulaFormDialog,
  FormulaDeleteDialog,
  FormulaImportDialog,
  FormulaFilters,
  FormulaTable,
  FormulaPagination,
} from "@/components/finance/formula"

import { useFormulas, useExportFormulas } from "@/hooks/finance/use-formula"
import { useUrlState } from "@/lib/hooks"
import {
  type Formula,
  type ListFormulasParams,
  FormulaType,
} from "@/types/finance/formula"
import { ActiveFilter } from "@/types/finance/uom"

const defaultFilters: ListFormulasParams = {
  page: 1,
  pageSize: 10,
  search: "",
  formulaType: FormulaType.FORMULA_TYPE_UNSPECIFIED,
  activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
  sortBy: "code",
  sortOrder: "asc",
}

function FormulaPageContent() {
  const [filters, setFilters] = useUrlState<ListFormulasParams>({
    defaultValues: defaultFilters,
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)

  const { data, isLoading, isError, error } = useFormulas(filters)
  const exportMutation = useExportFormulas()

  const handleAddNew = () => {
    setSelectedFormula(null)
    setIsFormOpen(true)
  }

  const handleEdit = (formula: Formula) => {
    setSelectedFormula(formula)
    setIsFormOpen(true)
  }

  const handleDelete = (formula: Formula) => {
    setSelectedFormula(formula)
    setIsDeleteOpen(true)
  }

  const handleExport = async () => {
    await exportMutation.mutateAsync({
      formulaType: filters.formulaType,
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
        title="Formulas"
        subtitle="Manage formulas for costing calculations"
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
            Add Formula
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Formula List</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : `${totalItems} total formulas`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormulaFilters filters={filters} onFiltersChange={setFilters} />

          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load formulas"}
            </div>
          )}

          <FormulaTable
            data={data?.data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <FormulaPagination
            pagination={data?.pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      <FormulaFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        formula={selectedFormula}
      />

      <FormulaDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        formula={selectedFormula}
      />

      <FormulaImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
    </div>
  )
}

function FormulaPageSkeleton() {
  return (
    <div>
      <PageHeader
        title="Formulas"
        subtitle="Manage formulas for costing calculations"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export/Import
          </Button>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Formula
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Formula List</CardTitle>
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

export default function FormulaPageClient() {
  return (
    <Suspense fallback={<FormulaPageSkeleton />}>
      <FormulaPageContent />
    </Suspense>
  )
}
