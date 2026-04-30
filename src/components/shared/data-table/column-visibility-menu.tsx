"use client"

import { Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { ColumnDef } from "./types"

interface Props<TData> {
  columns: ColumnDef<TData>[]
  visibility: Record<string, boolean>
  onToggle: (columnId: string) => void
  onSetAll: (visible: boolean) => void
  onReset: () => void
}

/** Column-visibility dropdown shown above the table when DataTable.tableId is set. */
export function ColumnVisibilityMenu<TData>({
  columns,
  visibility,
  onToggle,
  onSetAll,
  onReset,
}: Props<TData>) {
  const toggleable = columns.filter((c) => c.canHide !== false)
  if (toggleable.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[60vh] w-56 overflow-y-auto">
        <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {toggleable.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={visibility[column.id] !== false}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => onToggle(column.id)}
          >
            {column.header || column.id}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onSetAll(true)}>Show all</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSetAll(false)}>Hide all</DropdownMenuItem>
        <DropdownMenuItem onSelect={onReset}>Reset to default</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
