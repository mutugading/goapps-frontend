"use client"

import { DataTablePagination } from "@/components/shared"

interface UOMPaginationProps {
  pagination: {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
  } | undefined
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function UOMPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
}: UOMPaginationProps) {
  // Default values if pagination is undefined
  const currentPage = pagination?.currentPage ?? 1
  const pageSize = pagination?.pageSize ?? 10
  const totalItems = pagination?.totalItems ?? 0
  const totalPages = pagination?.totalPages ?? 0

  // Don't render if there's no data
  if (totalItems === 0) {
    return null
  }

  return (
    <DataTablePagination
      currentPage={currentPage}
      pageSize={pageSize}
      totalItems={totalItems}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  )
}
