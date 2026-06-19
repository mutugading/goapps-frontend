"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/common/page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  useLookupMasterColumns,
  useLookupMasters,
  useCreateLookupMaster,
  useDeleteLookupMaster,
  useCreateLookupMasterColumn,
  useDeleteLookupMasterColumn,
} from "@/hooks/finance/use-lookup-master"
import type { LookupMaster, LookupMasterColumn } from "@/types/finance/lookup-master"

// ──────────────────────────────────────────────
// Sub-component: inline columns panel per master
// ──────────────────────────────────────────────

interface ColumnsPanelProps {
  masterCode: string
}

function ColumnsPanel({ masterCode }: ColumnsPanelProps) {
  const { data: columns, isLoading } = useLookupMasterColumns(masterCode)
  const createColumn = useCreateLookupMasterColumn()
  const deleteColumn = useDeleteLookupMasterColumn()

  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<LookupMasterColumn | null>(null)

  // Form state for add column dialog
  const [colName, setColName] = useState("")
  const [colDisplay, setColDisplay] = useState("")
  const [colType, setColType] = useState<"NUMBER" | "TEXT">("NUMBER")
  const [colSort, setColSort] = useState(0)

  function handleOpenAdd() {
    setColName("")
    setColDisplay("")
    setColType("NUMBER")
    setColSort(0)
    setAddOpen(true)
  }

  async function handleAddColumn() {
    await createColumn.mutateAsync({
      lmcMasterCode: masterCode,
      lmcColumnName: colName,
      lmcDisplayName: colDisplay,
      lmcDataType: colType,
      lmcSortOrder: colSort,
    })
    setAddOpen(false)
  }

  return (
    <div className="border-t bg-muted/30 px-4 pb-4 pt-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Fillable Columns
        </p>
        <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={handleOpenAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add Column
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && (!columns || columns.length === 0) && (
        <p className="py-2 text-center text-xs text-muted-foreground">No columns configured yet.</p>
      )}

      {!isLoading && columns && columns.length > 0 && (
        <div className="divide-y rounded-md border bg-background">
          {columns.map((col) => (
            <div key={col.lmcId || col.lmcColumnName} className="flex items-center gap-3 px-3 py-2">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{col.lmcDisplayName}</span>
                <span className="ml-2 font-mono text-xs text-muted-foreground">{col.lmcColumnName}</span>
              </div>
              <Badge variant={col.lmcDataType === "NUMBER" ? "secondary" : "outline"} className="text-xs">
                {col.lmcDataType}
              </Badge>
              <span className="text-xs text-muted-foreground w-10 text-right">#{col.lmcSortOrder}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteTarget(col)}
                disabled={!col.lmcId}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Delete column</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Column Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add Column to {masterCode}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="col-name">
                Column Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="col-name"
                placeholder="e.g. mc_speed"
                value={colName}
                onChange={(e) => setColName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">The actual database column name from the master table.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="col-display">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="col-display"
                placeholder="e.g. Machine Speed"
                value={colDisplay}
                onChange={(e) => setColDisplay(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Data Type <span className="text-destructive">*</span>
              </Label>
              <Select value={colType} onValueChange={(v) => setColType(v as "NUMBER" | "TEXT")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NUMBER">NUMBER — numeric value (fills numeric CAPP params)</SelectItem>
                  <SelectItem value="TEXT">TEXT — text value (fills text CAPP params)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="col-sort">Sort Order</Label>
              <Input
                id="col-sort"
                type="number"
                placeholder="0"
                value={colSort}
                onChange={(e) => setColSort(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Lower numbers appear first in the column picker.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddColumn}
              disabled={!colName || !colDisplay || createColumn.isPending}
            >
              {createColumn.isPending ? "Adding…" : "Add Column"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete column */}
      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
          title="Delete Column"
          description={`Remove column "${deleteTarget.lmcDisplayName}" (${deleteTarget.lmcColumnName}) from ${masterCode}? This may affect cost parameters that reference this column.`}
          variant="destructive"
          confirmText="Delete"
          isLoading={deleteColumn.isPending}
          onConfirm={async () => {
            await deleteColumn.mutateAsync({ lmcId: deleteTarget.lmcId, masterCode })
            setDeleteTarget(null)
          }}
        />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Main page component
// ──────────────────────────────────────────────

export function LookupMastersPageClient() {
  const { data: masters, isLoading } = useLookupMasters(false)
  const createMaster = useCreateLookupMaster()
  const deleteMaster = useDeleteLookupMaster()

  const [expandedCode, setExpandedCode] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<LookupMaster | null>(null)

  // Form state for add master dialog
  const [code, setCode] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [apiPath, setApiPath] = useState("")
  const [codeField, setCodeField] = useState("")
  const [labelField, setLabelField] = useState("")

  function handleOpenAdd() {
    setCode("")
    setDisplayName("")
    setApiPath("")
    setCodeField("")
    setLabelField("")
    setAddOpen(true)
  }

  async function handleAddMaster() {
    await createMaster.mutateAsync({
      lmCode: code,
      lmDisplayName: displayName,
      lmApiPath: apiPath,
      lmCodeField: codeField,
      lmLabelField: labelField,
    })
    setAddOpen(false)
  }

  function toggleExpand(lmCode: string) {
    setExpandedCode((prev) => (prev === lmCode ? null : lmCode))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lookup Masters"
        subtitle="Registry of master tables available for MASTER_LOOKUP parameter dropdowns in costing."
      >
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Master
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Registered Masters</CardTitle>
          <CardDescription>
            Each master entry maps a backend table to a dropdown in the CAPP form. Columns define
            which fields can be auto-filled when a user selects a lookup value.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded bg-muted" />
              ))}
            </div>
          )}

          {!isLoading && (!masters || masters.length === 0) && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No lookup masters registered yet. Add one to enable MASTER_LOOKUP parameters.
            </p>
          )}

          {!isLoading && masters && masters.length > 0 && (
            <div className="divide-y">
              {masters.map((master) => {
                const isExpanded = expandedCode === master.lmCode
                return (
                  <div key={master.lmCode}>
                    {/* Master row */}
                    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                      {/* Code badge */}
                      <Badge variant="secondary" className="font-mono text-xs">
                        {master.lmCode}
                      </Badge>

                      {/* Name + path */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{master.lmDisplayName}</p>
                        <p className="font-mono text-xs text-muted-foreground">{master.lmApiPath}</p>
                      </div>

                      {/* Code / label fields */}
                      <div className="hidden md:flex gap-4 text-xs text-muted-foreground">
                        <span>
                          Code: <code className="font-mono">{master.lmCodeField}</code>
                        </span>
                        <span>
                          Label: <code className="font-mono">{master.lmLabelField}</code>
                        </span>
                      </div>

                      {/* Active badge */}
                      <Badge variant={master.lmIsActive ? "default" : "outline"} className="text-xs">
                        {master.lmIsActive ? "Active" : "Inactive"}
                      </Badge>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => toggleExpand(master.lmCode)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5" />
                              Hide Columns
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5" />
                              Manage Columns
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(master)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete master</span>
                        </Button>
                      </div>
                    </div>

                    {/* Expanded columns panel */}
                    {isExpanded && <ColumnsPanel masterCode={master.lmCode} />}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Master Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Lookup Master</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="lm-code">
                Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lm-code"
                placeholder="e.g. MACHINE"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <p className="text-xs text-muted-foreground">
                Uppercase letters, digits, underscores. This is the identifier used in param definitions
                (e.g., <code className="font-mono">MACHINE</code>, <code className="font-mono">INTERMINGLING</code>).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lm-display">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lm-display"
                placeholder="e.g. Yarn Machine"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lm-api">
                API Path <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lm-api"
                placeholder="e.g. /api/v1/finance/machines"
                value={apiPath}
                onChange={(e) => setApiPath(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The BFF endpoint that returns the list of items for the dropdown.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lm-code-field">
                  Code Field <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lm-code-field"
                  placeholder="e.g. machineCode"
                  value={codeField}
                  onChange={(e) => setCodeField(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">JSON field used as the option value.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lm-label-field">
                  Label Field <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lm-label-field"
                  placeholder="e.g. machineName"
                  value={labelField}
                  onChange={(e) => setLabelField(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">JSON field displayed as the option label.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMaster}
              disabled={!code || !displayName || !apiPath || !codeField || !labelField || createMaster.isPending}
            >
              {createMaster.isPending ? "Creating…" : "Create Master"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete master */}
      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
          title="Delete Lookup Master"
          description={`Remove "${deleteTarget.lmDisplayName}" (${deleteTarget.lmCode}) from the registry? All columns configured for this master will also be removed. Any parameters that reference this master code will stop working.`}
          variant="destructive"
          confirmText="Delete"
          isLoading={deleteMaster.isPending}
          onConfirm={async () => {
            await deleteMaster.mutateAsync(deleteTarget.lmCode)
            setDeleteTarget(null)
          }}
        />
      )}
    </div>
  )
}
