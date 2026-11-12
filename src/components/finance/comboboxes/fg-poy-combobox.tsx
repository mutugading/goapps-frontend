"use client"

// FgPoyCombobox — picks the FG (POY) cost product linked to an MB recipe / spin.
// Lists active POY products; when `shadeCode` is given only products with an empty
// shade or the same shade (case/space-insensitive) are offered. `allowCreate`
// adds a "+ Create POY" item opening CreatePoyMiniDialog.
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCostProductMasters, useCreateCostProductMaster } from "@/hooks/finance/use-cost-product-master"
import { useCostProductTypes } from "@/hooks/finance/use-cost-product-type"
import { cn } from "@/lib/utils"

export interface FgPoyProduct {
  productSysId: number
  productCode: string
  productName: string
  erpItemCode: string
  shadeCode: string
}

interface FgPoyComboboxProps {
  value?: number
  shadeCode?: string
  onChange: (id: number, product: FgPoyProduct) => void
  disabled?: boolean
  allowCreate?: boolean
  placeholder?: string
  className?: string
  /** Shown on the trigger when `value` is set but not in the current result list (e.g. edit mode). */
  selectedLabel?: string
  /** Offer only POYs whose shade equals `shadeCode` (no blank-shade POYs). Needed where the backend never fills a blank shade (manual spin FG edit). */
  requireShadeMatch?: boolean
}

const norm = (s?: string) => (s ?? "").trim().toUpperCase()

function usePoyTypeId() {
  const { data } = useCostProductTypes({ search: "POY", activeFilter: "active", pageSize: 50 })
  return useMemo(() => (data?.items ?? []).find((t) => norm(t.typeCode) === "POY")?.typeId, [data])
}

export function FgPoyCombobox({
  value,
  shadeCode,
  onChange,
  disabled,
  allowCreate,
  placeholder = "Select FG (POY)…",
  className,
  selectedLabel,
  requireShadeMatch = false,
}: FgPoyComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [picked, setPicked] = useState<FgPoyProduct | null>(null)
  const poyTypeId = usePoyTypeId()
  const listParams = {
    search,
    productTypeIds: poyTypeId ? [poyTypeId] : undefined,
    activeFilter: "active" as const,
    pageSize: 50,
  }
  // P8-R-FE-2: with a shade, query it server-side so matches past the first page are found;
  // the generic query (same cache key as the unshaded case) supplies blank-shade POYs.
  const wantShade = shadeCode?.trim() ?? ""
  const shaded = useCostProductMasters({ ...listParams, shadeCode: wantShade || undefined })
  const generic = useCostProductMasters(listParams)
  const isLoading = shaded.isLoading || generic.isLoading
  const truncated = [shaded.data, generic.data].some(
    (d) => d && Number(d.pagination?.totalItems ?? 0) > (d.items?.length ?? 0),
  )

  const items = useMemo(() => {
    const want = norm(shadeCode)
    if (!poyTypeId) return [] // never list non-POY products while the type is unresolved
    const seen = new Set<number>()
    const rows = [...(shaded.data?.items ?? []), ...(wantShade && requireShadeMatch ? [] : (generic.data?.items ?? []))]
    return rows
      .filter((p) => p.productTypeId === poyTypeId)
      .filter((p) => {
        if (seen.has(p.productSysId)) return false
        seen.add(p.productSysId)
        return true
      })
      .filter((p) =>
        requireShadeMatch && want ? norm(p.shadeCode) === want : !want || !norm(p.shadeCode) || norm(p.shadeCode) === want,
      )
      .map<FgPoyProduct>((p) => ({
        productSysId: p.productSysId,
        productCode: p.productCode,
        productName: p.productName,
        erpItemCode: p.erpItemCode ?? "",
        shadeCode: p.shadeCode ?? "",
      }))
  }, [shaded.data, generic.data, shadeCode, wantShade, poyTypeId, requireShadeMatch])

  const selected = useMemo(
    () => items.find((p) => p.productSysId === value) ?? (picked && picked.productSysId === value ? picked : null),
    [items, picked, value],
  )

  const select = (p: FgPoyProduct) => {
    setPicked(p)
    onChange(p.productSysId, p)
    setOpen(false)
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="FG Product (POY)"
            disabled={disabled}
            className={cn("w-full justify-between font-normal", className)}
          >
            {selected ? (
              <span className="truncate">
                <span className="text-muted-foreground">{selected.productCode}</span> — {selected.productName}
              </span>
            ) : value && selectedLabel ? (
              <span className="truncate">{selectedLabel}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search by code, name or Orion code…" value={search} onValueChange={setSearch} />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              )}
              <CommandEmpty>No POY product matches.</CommandEmpty>
              {truncated && (
                <div className="px-3 py-1.5 text-xs text-muted-foreground">Showing the first 50 results. Refine your search.</div>
              )}
              <CommandGroup>
                {items.map((p) => (
                  <CommandItem key={p.productSysId} value={`${p.productCode} ${p.productName}`} onSelect={() => select(p)}>
                    <Check className={cn("mr-2 h-4 w-4", value === p.productSysId ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                      <div>
                        <span className="font-mono text-xs mr-2 text-muted-foreground">{p.productCode}</span>
                        <span>{p.productName}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {p.erpItemCode ? `Orion ${p.erpItemCode}` : "No Orion code"}
                        {p.shadeCode ? ` · Shade ${p.shadeCode}` : ""}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              {allowCreate && (
                <CommandGroup>
                  <CommandItem
                    value="__create_poy__"
                    onSelect={() => {
                      setOpen(false)
                      setCreateOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {search.trim() ? `+ Create POY '${search.trim()}'` : "+ Create POY"}
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {allowCreate && (
        <CreatePoyMiniDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          initialName={search.trim()}
          shadeCode={shadeCode}
          poyTypeId={poyTypeId}
          onCreated={select}
        />
      )}
    </>
  )
}

interface CreatePoyMiniDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialName: string
  shadeCode?: string
  poyTypeId?: number
  onCreated: (p: FgPoyProduct) => void
}

/** Minimal POY create: name + optional Orion code; shade fixed, grade "AX". */
export function CreatePoyMiniDialog(props: CreatePoyMiniDialogProps) {
  // Remount on open so the name is re-prefilled without a setState-in-effect.
  return props.open ? <CreatePoyMiniDialogInner {...props} /> : null
}

function CreatePoyMiniDialogInner({ onOpenChange, initialName, shadeCode, poyTypeId, onCreated }: CreatePoyMiniDialogProps) {
  const [name, setName] = useState(initialName)
  const [orion, setOrion] = useState("")
  const create = useCreateCostProductMaster()
  const canSave = !!poyTypeId && name.trim().length > 0 && !create.isPending

  const save = async () => {
    if (!poyTypeId) return
    try {
      const p = await create.mutateAsync({
        productTypeId: poyTypeId,
        productName: name.trim(),
        shadeCode: shadeCode ?? "",
        gradeCode: "AX",
        description: "",
        erpItemCode: orion.trim() || undefined,
      })
      onCreated({
        productSysId: p.productSysId,
        productCode: p.productCode,
        productName: p.productName,
        erpItemCode: p.erpItemCode ?? orion.trim(),
        shadeCode: p.shadeCode ?? shadeCode ?? "",
      })
      onOpenChange(false)
    } catch {
      // toast handled in hook
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Create POY product</DialogTitle>
          <DialogDescription>Quick-create a POY product to link as the FG of this recipe.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="poy-name">Name</Label>
            <Input id="poy-name" value={name} maxLength={200} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="poy-orion">Orion code (optional)</Label>
            <Input id="poy-orion" value={orion} maxLength={50} onChange={(e) => setOrion(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="poy-shade">Shade</Label>
            <Input id="poy-shade" value={shadeCode ?? ""} readOnly disabled />
          </div>
          <p className="text-muted-foreground text-xs">Grade: AX</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={create.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={!canSave}>
            {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
