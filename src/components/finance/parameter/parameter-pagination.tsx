"use client"

import { DataTablePagination } from "@/components/shared"

interface ParameterPaginationProps {
  pagination: {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
  } | undefined
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function ParameterPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
}: ParameterPaginationProps) {
  const currentPage = pagination?.currentPage ?? 1
  const pageSize = pagination?.pageSize ?? 10
  const totalItems = pagination?.totalItems ?? 0
  const totalPages = pagination?.totalPages ?? 0

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
