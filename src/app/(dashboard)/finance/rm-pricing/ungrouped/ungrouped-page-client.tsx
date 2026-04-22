"use client"

import { Suspense, useEffect } from "react"
import { AlertCircle, Loader2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageHeader } from "@/components/common/page-header"

import {
  UngroupedTable,
  UngroupedFilters,
  UngroupedPagination,
} from "@/components/finance/rm-pricing/ungrouped"

import { useUngroupedItems } from "@/hooks/finance/use-ungrouped-items"
import { useSyncPeriods } from "@/hooks/finance/use-oracle-sync"
import { useUrlState } from "@/lib/hooks"
import type { ListUngroupedItemsParams } from "@/types/finance/rm-group"

const defaultFilters: ListUngroupedItemsParams = {
  period: "",
  page: 1,
  pageSize: 20,
  search: "",
}

function UngroupedPageContent() {
  const [filters, setFilters] = useUrlState<ListUngroupedItemsParams>({
    defaultValues: defaultFilters,
  })

  const { data, isLoading, isError, error } = useUngroupedItems(filters)
  const { data: periodsData } = useSyncPeriods()
  const availablePeriods = periodsData?.periods || []

  // Auto-select the latest available period once, if none is selected.
  useEffect(() => {
    if (!filters.period && availablePeriods.length > 0) {
      setFilters((prev) => ({ ...prev, period: availablePeriods[0], page: 1 }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availablePeriods.length, filters.period])

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }))
  }

  const totalItems = data?.pagination?.totalItems ?? 0

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <PageHeader
        title="Ungrouped Items"
        subtitle="Raw material items not assigned to any RM group"
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Warning banner when items exist */}
        {totalItems > 0 && (
          <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 [&>svg]:text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-medium">
              {totalItems} ungrouped item{totalItems !== 1 ? "s" : ""}
            </AlertTitle>
            <AlertDescription>
              Items not assigned to any group will not have cost calculations.
              Products using these items may have incomplete pricing data.
            </AlertDescription>
          </Alert>
        )}

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Ungrouped Items</CardTitle>
            <CardDescription>
              {!filters.period
                ? "Select a period to view ungrouped items"
                : isLoading
                ? "Loading..."
                : `${totalItems} ungrouped items for period ${filters.period}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 min-w-0">
            <UngroupedFilters
              filters={filters}
              onFiltersChange={setFilters}
              availablePeriods={availablePeriods}
            />

            {isError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
                {error instanceof Error
                  ? error.message
                  : "Failed to load ungrouped items"}
              </div>
            )}

            {!filters.period && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4 opacity-30" />
                <p className="text-lg font-medium">Select a period</p>
                <p className="text-sm">
                  Enter a period (e.g., 202601) to see ungrouped items
                </p>
              </div>
            )}

            {filters.period && (
              <>
                <UngroupedTable
                  data={data?.data || []}
                  isLoading={isLoading}
                />

                <UngroupedPagination
                  pagination={data?.pagination}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UngroupedPageSkeleton() {
  return (
    <div className="w-full min-w-0 overflow-hidden space-y-4">
      <PageHeader
        title="Ungrouped Items"
        subtitle="Raw material items not assigned to any RM group"
      />
      <div className="grid grid-cols-1 gap-6">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Ungrouped Items</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function UngroupedPageClient() {
  return (
    <Suspense fallback={<UngroupedPageSkeleton />}>
      <UngroupedPageContent />
    </Suspense>
  )
}
