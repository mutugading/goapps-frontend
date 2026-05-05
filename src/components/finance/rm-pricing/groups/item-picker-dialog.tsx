"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Search, Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

import { useUngroupedItems } from "@/hooks/finance/use-ungrouped-items"
import { useAddItemsToGroup } from "@/hooks/finance/use-rm-group-items"
import type { UngroupedItem } from "@/types/finance/rm-group"

interface ItemPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupHeadId: string
  groupCode: string
}

// Composite unique key — the grouping monitor returns one row per
// (item_code, grade_code) pair, so this is enough on its own; index is
// kept as a tie-breaker.
function itemUniqueKey(item: UngroupedItem, index: number): string {
  return `${item.itemCode}::${item.gradeCode || ""}::${index}`
}

// Stored metadata for each selected item (needed so the backend can populate detail columns).
interface SelectedItemMeta {
  itemCode: string
  itemName: string
  gradeCode: string
  itemGrade: string
  uomCode: string
  itemTypeCode: string
}

export function ItemPickerDialog({
  open,
  onOpenChange,
  groupHeadId,
  groupCode,
}: ItemPickerDialogProps) {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  // Map from composite key → item metadata.
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItemMeta>>(new Map())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // Inline debounce for search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading } = useUngroupedItems({
    page,
    pageSize,
    search: debouncedSearch,
    scope: "ungrouped",
  })

  const addItemsMutation = useAddItemsToGroup()

  const items = useMemo(() => data?.data || [], [data?.data])
  const totalItems = data?.pagination?.totalItems ?? 0
  const totalPages = data?.pagination?.totalPages ?? 0

  const toggleItem = useCallback((item: UngroupedItem, index: number) => {
    const key = itemUniqueKey(item, index)
    setSelectedItems((prev) => {
      const next = new Map(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.set(key, {
          itemCode: item.itemCode,
          itemName: item.itemName || "",
          gradeCode: item.gradeCode || "",
          itemGrade: item.itemGrade || "",
          uomCode: item.uomCode || "",
          itemTypeCode: "",
        })
      }
      return next
    })
  }, [])

  const toggleAllOnPage = useCallback(() => {
    setSelectedItems((prev) => {
      const next = new Map(prev)
      const pageKeys = items.map((i, idx) => itemUniqueKey(i, idx))
      const allSelected = pageKeys.every((k) => prev.has(k))

      if (allSelected) {
        // Deselect all on current page
        pageKeys.forEach((k) => next.delete(k))
      } else {
        // Select all on current page
        items.forEach((item, idx) => {
          const key = itemUniqueKey(item, idx)
          if (!next.has(key)) {
            next.set(key, {
              itemCode: item.itemCode,
              itemName: item.itemName || "",
              gradeCode: item.gradeCode || "",
              itemGrade: item.itemGrade || "",
              uomCode: item.uomCode || "",
              itemTypeCode: "",
            })
          }
        })
      }
      return next
    })
  }, [items])

  const handleAdd = async () => {
    if (selectedItems.size === 0) return

    try {
      // Send structured selections (item_code, grade_code) so the backend
      // picks the exact variant the user saw in the picker — an item_code
      // with multiple grade_code variants in the sync feed is no longer
      // ambiguous.
      const selections = Array.from(selectedItems.values()).map((m) => ({
        itemCode: m.itemCode,
        gradeCode: m.gradeCode || "",
      }))
      await addItemsMutation.mutateAsync({
        groupHeadId,
        selections,
      })
      setSelectedItems(new Map())
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add items:", error)
    }
  }

  // Reset state when dialog opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedItems(new Map())
      setSearchInput("")
      setPage(1)
    }
    onOpenChange(isOpen)
  }

  const allOnPageSelected =
    items.length > 0 && items.every((i, idx) => selectedItems.has(itemUniqueKey(i, idx)))
  const someOnPageSelected = items.some((i, idx) => selectedItems.has(itemUniqueKey(i, idx)))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[1000px] h-[85vh] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Items to {groupCode}</DialogTitle>
          <DialogDescription>
            Select ungrouped raw materials to add to this group.
            Items already assigned to another group are excluded — each item can only belong to one group.
            Use search to find specific items, then check multiple items to bulk-add them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0 pt-1">
          {/* Search row */}
          <div className="flex gap-2 flex-shrink-0 px-0.5">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search item code, name, or grade..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>

          {/* Item list */}
          <div className="flex-1 rounded-md border min-h-0 overflow-auto">
              <div className="min-w-[800px]">
                {/* Header row */}
                <div className="flex items-center gap-3 px-3 py-2 border-b bg-background text-xs font-medium text-muted-foreground sticky top-0 z-10 shadow-sm">
                  <Checkbox
                    checked={allOnPageSelected}
                    ref={(el) => {
                      if (el) {
                        const input = el as unknown as HTMLButtonElement
                        input.dataset.indeterminate = String(someOnPageSelected && !allOnPageSelected)
                      }
                    }}
                    onCheckedChange={toggleAllOnPage}
                    disabled={isLoading || items.length === 0}
                  />
                  <span className="w-[120px]">Item Code</span>
                  <span className="flex-1">Item Name</span>
                  <span className="w-[70px]">Grade</span>
                  <span className="w-[160px]">Grade Name</span>
                  <span className="w-[50px] text-right px-2">UOM</span>
                </div>

                <div className="p-1 pt-0">
                  {isLoading && (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {!isLoading && items.length === 0 && (
                    <div className="py-16 text-center text-muted-foreground text-sm">
                      {debouncedSearch
                        ? "No matching ungrouped items found"
                        : "All items for this period are already grouped"}
                    </div>
                  )}

                  {items.map((item, index) => {
                    const key = itemUniqueKey(item, index)
                    const isSelected = selectedItems.has(key)
                    return (
                      <label
                        key={key}
                        className={`flex flex-col gap-0.5 px-3 py-2 cursor-pointer rounded-md transition-colors border-l-4 mt-1 first:mt-0 ${
                          isSelected
                            ? "bg-primary/15 border-l-primary ring-1 ring-primary/30"
                            : "border-l-transparent hover:bg-accent/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleItem(item, index)}
                          />
                          <span className="w-[120px] font-mono text-xs truncate">
                            {item.itemCode}
                          </span>
                          <span className="flex-1 text-sm truncate">
                            {item.itemName || "—"}
                          </span>
                          <span className="w-[70px] text-xs text-muted-foreground truncate">
                            {item.gradeCode || "—"}
                          </span>
                          <span className="w-[160px] text-xs text-muted-foreground truncate">
                            {item.itemGrade || "—"}
                          </span>
                          <span className="w-[50px] text-right text-xs text-muted-foreground px-2">
                            {item.uomCode || "—"}
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs">Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[25, 50, 100, 200].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs">
                  Page {page} of {totalPages || 1} · {totalItems} items
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Selection summary */}
          {selectedItems.size > 0 && (
            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30 flex-shrink-0">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="default">{selectedItems.size}</Badge>
                <span className="text-muted-foreground">
                  item{selectedItems.size !== 1 ? "s" : ""} selected for bulk add
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItems(new Map())}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <Separator className="flex-shrink-0" />

        <DialogFooter className="flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={addItemsMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedItems.size === 0 || addItemsMutation.isPending}
          >
            {addItemsMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Plus className="mr-2 h-4 w-4" />
            Add {selectedItems.size} Item{selectedItems.size !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
