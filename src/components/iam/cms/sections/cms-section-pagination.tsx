"use client"

import { DataTablePagination } from "@/components/shared"

interface CMSSectionPaginationProps {
  pagination: {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
  } | undefined
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function CMSSectionPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
}: CMSSectionPaginationProps) {
  const totalItems = pagination?.totalItems ?? 0

  if (totalItems === 0) {
    return null
  }

  return (
    <DataTablePagination
      currentPage={pagination?.currentPage ?? 1}
      pageSize={pagination?.pageSize ?? 10}
      totalItems={totalItems}
      totalPages={pagination?.totalPages ?? 0}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  )
}
