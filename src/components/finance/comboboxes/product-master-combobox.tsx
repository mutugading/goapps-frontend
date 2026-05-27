"use client"

// ProductMasterCombobox — picks a CostProductMaster by product_code/product_name. Used when rm_type.reference_target = PRODUCT.
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCostProductMasters } from "@/hooks/finance/use-cost-product-master"
import { cn } from "@/lib/utils"

interface ProductMasterComboboxProps {
  value: number | undefined
  onChange: (productSysId: number, productCode: string, productName: string) => void
  excludeSysId?: number
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ProductMasterCombobox({
  value, onChange, excludeSysId, placeholder = "Select product…", disabled, className,
}: ProductMasterComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useCostProductMasters({ search, activeFilter: "active", pageSize: 50 })
  const filtered = useMemo(
    () => (data?.items ?? []).filter((p) => p.productSysId !== excludeSysId),
    [data, excludeSysId],
  )
  const selected = useMemo(() => filtered.find((p) => p.productSysId === value), [filtered, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          {selected ? (
            <span className="truncate">
              <span className="text-muted-foreground">{selected.productCode}</span> — {selected.productName}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search by code or name…" value={search} onValueChange={setSearch} />
          <CommandList>
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
            <CommandEmpty>No product matches.</CommandEmpty>
            <CommandGroup>
              {filtered.map((p) => (
                <CommandItem
                  key={p.productSysId}
                  value={`${p.productCode} ${p.productName}`}
                  onSelect={() => {
                    onChange(p.productSysId, p.productCode, p.productName)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === p.productSysId ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <div>
                      <span className="font-mono text-xs mr-2 text-muted-foreground">{p.productCode}</span>
                      <span>{p.productName}</span>
                    </div>
                    {p.productTypeCode && (
                      <span className="text-xs text-muted-foreground">{p.productTypeCode}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
