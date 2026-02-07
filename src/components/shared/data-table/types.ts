// DataTable Types

import type { ReactNode } from "react"

/**
 * Column definition for DataTable
 */
export interface ColumnDef<TData> {
  /** Unique identifier for the column */
  id: string
  /** Column header label */
  header: string
  /** Accessor key to get cell value from data */
  accessorKey?: keyof TData
  /** Custom cell renderer */
  cell?: (row: TData, index: number) => ReactNode
  /** Column width class (e.g., 'w-[100px]') */
  width?: string
  /** Additional class names for header */
  headerClassName?: string
  /** Additional class names for cell */
  cellClassName?: string
  /** Hide column on mobile */
  hideOnMobile?: boolean
}

/**
 * Action definition for row actions
 */
export interface RowAction<TData> {
  /** Unique identifier for the action */
  id: string
  /** Action label */
  label: string
  /** Icon component */
  icon?: ReactNode
  /** Action handler */
  onClick: (row: TData) => void
  /** Whether to show in destructive color */
  variant?: "default" | "destructive"
  /** Whether the action is disabled */
  disabled?: (row: TData) => boolean
}

/**
 * DataTable props
 */
export interface DataTableProps<TData> {
  /** Data to display */
  data: TData[]
  /** Column definitions */
  columns: ColumnDef<TData>[]
  /** Unique key field in data */
  keyField: keyof TData
  /** Row actions */
  actions?: RowAction<TData>[]
  /** Loading state */
  isLoading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Empty state description */
  emptyDescription?: string
  /** Skeleton row count when loading */
  skeletonRowCount?: number
}

/**
 * Pagination props
 */
export interface DataTablePaginationProps {
  /** Current page (1-indexed) */
  currentPage: number
  /** Items per page */
  pageSize: number
  /** Total number of items */
  totalItems: number
  /** Total number of pages */
  totalPages: number
  /** Page change handler */
  onPageChange: (page: number) => void
  /** Page size change handler */
  onPageSizeChange: (pageSize: number) => void
  /** Available page size options */
  pageSizeOptions?: number[]
}
