"use client"

// Group management — CRUD list for dashboard groups.

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useDashboardGroups,
  useCreateDashboardGroup,
  useUpdateDashboardGroup,
  useDeleteDashboardGroup,
} from "@/hooks/bi/use-group"
import type { DashboardGroup } from "@/types/bi"

export function GroupManagement() {
  const { data: groups, isLoading } = useDashboardGroups(true)
  const createMut = useCreateDashboardGroup()
  const updateMut = useUpdateDashboardGroup()
  const deleteMut = useDeleteDashboardGroup()

  const [editing, setEditing] = useState<DashboardGroup | null>(null)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ code: "", name: "", icon: "", displayOrder: 0 })

  function openCreate() {
    setEditing(null)
    setDraft({ code: "", name: "", icon: "", displayOrder: 0 })
    setOpen(true)
  }
  function openEdit(g: DashboardGroup) {
    setEditing(g)
    setDraft({ code: g.groupCode, name: g.groupName, icon: g.icon, displayOrder: g.displayOrder })
    setOpen(true)
  }

  async function save() {
    if (editing) {
      await updateMut.mutateAsync({
        groupId: editing.groupId,
        groupName: draft.name,
        icon: draft.icon,
        displayOrder: draft.displayOrder,
      } as never)
    } else {
      await createMut.mutateAsync({
        groupCode: draft.code,
        groupName: draft.name,
        icon: draft.icon,
        displayOrder: draft.displayOrder,
        isActive: true,
        description: "",
      } as never)
    }
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>+ New Group</Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
            ) : (
              (groups ?? []).map((g) => (
                <TableRow key={g.groupId}>
                  <TableCell className="font-mono text-xs">{g.groupCode}</TableCell>
                  <TableCell className="font-medium">{g.groupName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{g.icon}</TableCell>
                  <TableCell>{g.displayOrder}</TableCell>
                  <TableCell><Badge variant={g.isActive ? "default" : "outline"}>{g.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(g)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => void deleteMut.mutateAsync(g.groupId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Group" : "New Group"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {!editing && (
              <div className="space-y-1.5">
                <Label>Code</Label>
                <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Icon (lucide name)</Label>
              <Input value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} placeholder="Wallet" />
            </div>
            <div className="space-y-1.5">
              <Label>Display Order</Label>
              <Input type="number" value={draft.displayOrder} onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) || 0 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
