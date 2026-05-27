"use client"

import { Suspense } from "react"
import { AlertCircle, Loader2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageHeader } from "@/components/common/page-header"

import {
  UngroupedTable,
  UngroupedFilters,
  UngroupedPagination,
} from "@/components/finance/rm-pricing/ungrouped"

import { useUngroupedItems } from "@/hooks/finance/use-ungrouped-items"
import { useUrlState } from "@/lib/hooks"
import type { GroupingScope, ListUngroupedItemsParams } from "@/types/finance/rm-group"

const defaultFilters: ListUngroupedItemsParams = {
  page: 1,
  pageSize: 20,
  search: "",
  scope: "ungrouped",
  sortBy: "item_code",
  sortOrder: "asc",
}

function UngroupedPageContent() {
  const [filters, setFilters] = useUrlState<ListUngroupedItemsParams>({
    defaultValues: defaultFilters,
  })

  const scope: GroupingScope = filters.scope === "grouped" ? "grouped" : "ungrouped"

  const { data, isLoading, isError, error } = useUngroupedItems(filters)

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }))
  }

  const handleScopeChange = (next: string) => {
    const nextScope: GroupingScope = next === "grouped" ? "grouped" : "ungrouped"
    // Reset sort when leaving grouped scope so any group_* sort key falls
    // back to the default (item_code asc) — backend ignores group_* keys
    // in ungrouped scope but the dropdown should reflect a valid value.
    const sortBy = nextScope === "ungrouped" && filters.sortBy && filters.sortBy.startsWith("group")
      ? "item_code"
      : filters.sortBy
    setFilters((prev) => ({ ...prev, scope: nextScope, sortBy, page: 1 }))
  }

  const totalItems = data?.pagination?.totalItems ?? 0

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <PageHeader
        title="Grouping Monitor"
        subtitle="Track which raw materials are assigned to a group and which are not (cross-period)"
      />

      <div className="grid grid-cols-1 gap-6">
        {scope === "ungrouped" && totalItems > 0 && (
          <Alert
            variant="destructive"
            className="border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 [&>svg]:text-amber-600"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-medium">
              {totalItems} ungrouped item{totalItems !== 1 ? "s" : ""}
            </AlertTitle>
            <AlertDescription>
              These (item_code, grade_code) pairs are not assigned to any active group, so cost
              calculations will skip them.
            </AlertDescription>
          </Alert>
        )}

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>
              {scope === "grouped" ? "Grouped Items" : "Ungrouped Items"}
            </CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading..."
                : scope === "grouped"
                ? `${totalItems} item${totalItems !== 1 ? "s" : ""} currently assigned to a group`
                : `${totalItems} item${totalItems !== 1 ? "s" : ""} not assigned to any group`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 min-w-0">
            <Tabs value={scope} onValueChange={handleScopeChange}>
              <TabsList>
                <TabsTrigger value="ungrouped">Ungrouped</TabsTrigger>
                <TabsTrigger value="grouped">Grouped</TabsTrigger>
              </TabsList>
            </Tabs>

            <UngroupedFilters filters={filters} onFiltersChange={setFilters} scope={scope} />

            {isError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
                {error instanceof Error ? error.message : "Failed to load data"}
              </div>
            )}

            <UngroupedTable
              data={data?.data || []}
              isLoading={isLoading}
              scope={scope}
            />

            <UngroupedPagination
              pagination={data?.pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
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
        title="Grouping Monitor"
        subtitle="Track which raw materials are assigned to a group and which are not"
      />
      <div className="grid grid-cols-1 gap-6">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Grouping Monitor</CardTitle>
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
