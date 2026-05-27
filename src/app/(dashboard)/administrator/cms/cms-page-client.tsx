"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus, Loader2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/common/page-header"

import {
  CMSPageFormDialog,
  CMSPageDeleteDialog,
  CMSPageFilters,
  CMSPageTable,
  CMSPagePagination,
} from "@/components/iam/cms/pages"

import {
  CMSSectionFormDialog,
  CMSSectionDeleteDialog,
  CMSSectionFilters,
  CMSSectionTable,
  CMSSectionPagination,
} from "@/components/iam/cms/sections"

import { CMSSettingsForm } from "@/components/iam/cms/settings"

import { useCMSPages } from "@/hooks/iam/use-cms-page"
import { useCMSSections } from "@/hooks/iam/use-cms-section"
import { useUrlState } from "@/lib/hooks"

import type { CMSPage } from "@/types/iam/cms-page"
import type { ListCMSPagesParams } from "@/types/iam/cms-page"
import type { CMSSection } from "@/types/iam/cms-section"
import { CMSSectionType, type ListCMSSectionsParams } from "@/types/iam/cms-section"

// ============================================================================
// Pages Tab
// ============================================================================

const defaultPageFilters: ListCMSPagesParams = {
  page: 1,
  pageSize: 10,
  search: "",
  isPublished: null,
  sortBy: "sort_order",
  sortOrder: "asc",
}

function PagesTab() {
  const [filters, setFilters] = useUrlState<ListCMSPagesParams>({
    defaultValues: defaultPageFilters,
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<CMSPage | null>(null)

  const { data, isLoading } = useCMSPages(filters)

  const handleCreate = () => {
    setSelectedPage(null)
    setIsFormOpen(true)
  }

  const handleEdit = (page: CMSPage) => {
    setSelectedPage(page)
    setIsFormOpen(true)
  }

  const handleDelete = (page: CMSPage) => {
    setSelectedPage(page)
    setIsDeleteOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Pages</CardTitle>
            <CardDescription>
              Total: {data?.pagination?.totalItems ?? 0} pages
            </CardDescription>
          </div>
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Page
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <CMSPageFilters filters={filters} onFiltersChange={setFilters} />
          <CMSPageTable
            data={data?.data ?? []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <CMSPagePagination
            pagination={data?.pagination}
            onPageChange={(page) => setFilters({ ...filters, page })}
            onPageSizeChange={(pageSize) => setFilters({ ...filters, pageSize, page: 1 })}
          />
        </CardContent>
      </Card>

      <CMSPageFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        page={selectedPage}
      />
      <CMSPageDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        page={selectedPage}
      />
    </>
  )
}

// ============================================================================
// Sections Tab
// ============================================================================

const defaultSectionFilters: ListCMSSectionsParams = {
  page: 1,
  pageSize: 10,
  search: "",
  sectionType: CMSSectionType.CMS_SECTION_TYPE_UNSPECIFIED,
  isPublished: null,
  sortBy: "sort_order",
  sortOrder: "asc",
}

function SectionsTab() {
  const [filters, setFilters] = useUrlState<ListCMSSectionsParams>({
    defaultValues: defaultSectionFilters,
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<CMSSection | null>(null)

  const { data, isLoading } = useCMSSections(filters)

  const handleCreate = () => {
    setSelectedSection(null)
    setIsFormOpen(true)
  }

  const handleEdit = (section: CMSSection) => {
    setSelectedSection(section)
    setIsFormOpen(true)
  }

  const handleDelete = (section: CMSSection) => {
    setSelectedSection(section)
    setIsDeleteOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Sections</CardTitle>
            <CardDescription>
              Total: {data?.pagination?.totalItems ?? 0} sections
            </CardDescription>
          </div>
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <CMSSectionFilters filters={filters} onFiltersChange={setFilters} />
          <CMSSectionTable
            data={data?.data ?? []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <CMSSectionPagination
            pagination={data?.pagination}
            onPageChange={(page) => setFilters({ ...filters, page })}
            onPageSizeChange={(pageSize) => setFilters({ ...filters, pageSize, page: 1 })}
          />
        </CardContent>
      </Card>

      <CMSSectionFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        section={selectedSection}
      />
      <CMSSectionDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        section={selectedSection}
      />
    </>
  )
}

// ============================================================================
// Settings Tab
// ============================================================================

function SettingsTab() {
  return (
    <CMSSettingsForm />
  )
}

// ============================================================================
// Main CMS Page Client
// ============================================================================

function CMSPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentTab = searchParams.get("tab") || "pages"

  const handleTabChange = (tab: string) => {
    router.push(`/administrator/cms?tab=${tab}`)
  }

  return (
    <>
      <PageHeader
        title="CMS Management"
        subtitle="Manage landing page content, sections, and site settings."
      />

      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <PagesTab />
        </TabsContent>

        <TabsContent value="sections">
          <SectionsTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </>
  )
}

export default function CMSPageClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CMSPageContent />
    </Suspense>
  )
}
