"use client"

// Admin dashboard list — table with edit/duplicate/delete/add-to-sidebar actions.

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Copy, Pencil, PanelLeft, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DebouncedSearchInput } from "@/components/common"
import { useDashboards, useDeleteDashboard, useDuplicateDashboard } from "@/hooks/bi/use-dashboard"
import { CHART_TYPE_LABELS, chartTypeToString, type Dashboard } from "@/types/bi"

export function DashboardList() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Dashboard | null>(null)
  const [dupTarget, setDupTarget] = useState<Dashboard | null>(null)
  const [dupCode, setDupCode] = useState("")
  const [sidebarTarget, setSidebarTarget] = useState<Dashboard | null>(null)
  const [sidebarTitle, setSidebarTitle] = useState("")
  const [sidebarIcon, setSidebarIcon] = useState("BarChart2")
  const [sidebarSaving, setSidebarSaving] = useState(false)

  const { data, isLoading } = useDashboards({ page: 1, pageSize: 100, search, includeInactive: true })
  const deleteMut = useDeleteDashboard()
  const dupMut = useDuplicateDashboard()

  function openSidebar(d: Dashboard) {
    setSidebarTarget(d)
    setSidebarTitle(d.dashboardTitle)
    setSidebarIcon("BarChart2")
  }

  async function handleAddToSidebar() {
    if (!sidebarTarget) return
    setSidebarSaving(true)
    try {
      const res = await fetch(
        `/api/v1/finance/bi/dashboards/${sidebarTarget.dashboardId}/add-to-sidebar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            menuTitle: sidebarTitle,
            menuIcon: sidebarIcon,
            sortOrder: 50,
          }),
        },
      )
      const json = (await res.json()) as { base?: { isSuccess?: boolean; message?: string } }
      if (json.base?.isSuccess) {
        toast.success("Dashboard added to sidebar")
        setSidebarTarget(null)
      } else {
        toast.error(json.base?.message ?? "Failed to add to sidebar")
      }
    } catch {
      toast.error("Failed to add to sidebar")
    } finally {
      setSidebarSaving(false)
    }
  }

  const dashboards = data?.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <DebouncedSearchInput value={search} onValueChange={setSearch} placeholder="Search dashboards..." debounceMs={300} />
        <Button asChild>
          <Link href="/finance/bi/admin/new">+ New Dashboard</Link>
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Chart</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : dashboards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No dashboards yet
                </TableCell>
              </TableRow>
            ) : (
              dashboards.map((d) => (
                <TableRow key={d.dashboardId}>
                  <TableCell className="font-mono text-xs">{d.dashboardCode}</TableCell>
                  <TableCell className="font-medium">{d.dashboardTitle}</TableCell>
                  <TableCell><Badge variant="secondary">{d.filterType}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {CHART_TYPE_LABELS[chartTypeToString(d.chartType)] ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={d.isActive ? "default" : "outline"}>{d.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => router.push(`/finance/bi/admin/${d.dashboardId}/edit`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setDupTarget(d)
                          setDupCode(`${d.dashboardCode}_COPY`)
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Add to Sidebar"
                        onClick={() => openSidebar(d)}
                      >
                        <PanelLeft className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(d)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete dashboard?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.dashboardTitle} will be soft-deleted and hidden from viewers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) void deleteMut.mutateAsync(deleteTarget.dashboardId)
                setDeleteTarget(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add to Sidebar dialog */}
      <Dialog open={Boolean(sidebarTarget)} onOpenChange={(o) => !o && setSidebarTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Sidebar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sidebar-title">Menu Title</Label>
              <Input
                id="sidebar-title"
                value={sidebarTitle}
                onChange={(e) => setSidebarTitle(e.target.value)}
                placeholder="Dashboard Title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sidebar-icon">Icon (lucide-react name)</Label>
              <Input
                id="sidebar-icon"
                value={sidebarIcon}
                onChange={(e) => setSidebarIcon(e.target.value)}
                placeholder="BarChart2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSidebarTarget(null)}>
              Cancel
            </Button>
            <Button onClick={() => void handleAddToSidebar()} disabled={sidebarSaving || !sidebarTitle.trim()}>
              {sidebarSaving ? "Adding…" : "Add to Sidebar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate confirm */}
      <AlertDialog open={Boolean(dupTarget)} onOpenChange={(o) => !o && setDupTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate dashboard</AlertDialogTitle>
            <AlertDialogDescription>Enter a code for the new copy.</AlertDialogDescription>
          </AlertDialogHeader>
          <input
            value={dupCode}
            onChange={(e) => setDupCode(e.target.value.toUpperCase())}
            className="h-9 w-full rounded-md border px-2 font-mono text-sm"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dupTarget) {
                  void dupMut.mutateAsync({
                    dashboardId: dupTarget.dashboardId,
                    newCode: dupCode,
                    newTitle: `Copy of ${dupTarget.dashboardTitle}`,
                  })
                }
                setDupTarget(null)
              }}
            >
              Duplicate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
