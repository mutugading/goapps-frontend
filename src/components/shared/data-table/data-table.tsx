"use client"

import { Pencil, Trash2, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import type { DataTableProps, RowAction } from "./types"

/**
 * Reusable data table component with loading state and actions
 */
export function DataTable<TData>({
  data,
  columns,
  keyField,
  actions,
  isLoading,
  emptyMessage = "No data found",
  emptyDescription = "Try adjusting your search or filter criteria",
  skeletonRowCount = 5,
}: DataTableProps<TData>) {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonRowCount }).map((_, i) => (
          <div key={`skeleton-${i}`} className="flex items-center gap-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">{emptyMessage}</p>
        <p className="text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    )
  }

  const hasActions = actions && actions.length > 0

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.id}
              className={cn(
                column.width,
                column.headerClassName,
                column.hideOnMobile && "hidden md:table-cell"
              )}
            >
              {column.header}
            </TableHead>
          ))}
          {hasActions && (
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => {
          const key = String(row[keyField]) || `row-${rowIndex}`
          return (
            <TableRow key={key}>
              {columns.map((column) => (
                <TableCell
                  key={`${key}-${column.id}`}
                  className={cn(
                    column.cellClassName,
                    column.hideOnMobile && "hidden md:table-cell"
                  )}
                >
                  {column.cell
                    ? column.cell(row, rowIndex)
                    : column.accessorKey
                    ? String(row[column.accessorKey] ?? "-")
                    : "-"}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell className="text-right">
                  <RowActions row={row} actions={actions!} />
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

/**
 * Row actions component with desktop buttons and mobile dropdown
 */
function RowActions<TData>({
  row,
  actions,
}: {
  row: TData
  actions: RowAction<TData>[]
}) {
  return (
    <>
      {/* Desktop actions */}
      <div className="hidden items-center justify-end gap-1 sm:flex">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="ghost"
            size="icon"
            onClick={() => action.onClick(row)}
            disabled={action.disabled?.(row)}
            title={action.label}
          >
            {action.icon}
          </Button>
        ))}
      </div>

      {/* Mobile dropdown */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                onClick={() => action.onClick(row)}
                disabled={action.disabled?.(row)}
                className={action.variant === "destructive" ? "text-destructive" : undefined}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
