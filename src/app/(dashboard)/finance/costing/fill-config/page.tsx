"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Trash2, ChevronsUpDown, Check, Loader2 } from "lucide-react";
import {
  useGlobalFillConfigs,
  useDeleteGlobalFillConfig,
  useProductFillConfigs,
} from "@/hooks/finance/use-fill-assignment";
import { useRouteByProduct, useRouteGraph } from "@/hooks/finance/use-cost-route";
import { useCostProductMasters } from "@/hooks/finance/use-cost-product-master";
import { FillConfigForm } from "@/components/finance/fill-assignment/FillConfigForm";
import { type LevelAssignmentConfig } from "@/types/finance/fill-assignment";
import { type CostProductMaster } from "@/types/finance/cost-product-master";
import { cn } from "@/lib/utils";

// ---------- Product picker ----------

interface ProductPickerProps {
  selected: CostProductMaster | null;
  onSelect: (product: CostProductMaster) => void;
}

function ProductPicker({ selected, onSelect }: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useCostProductMasters({
    search: search || undefined,
    page: 1,
    pageSize: 30,
    activeFilter: "active",
  });

  const items = data?.items ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-md justify-between"
        >
          {selected
            ? `${selected.productCode} — ${selected.productName}`
            : "Search product by code or name…"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[480px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search product by code or name…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading && <CommandEmpty>Loading…</CommandEmpty>}
            {!isLoading && items.length === 0 && (
              <CommandEmpty>No products found.</CommandEmpty>
            )}
            <CommandGroup>
              {items.map((p) => (
                <CommandItem
                  key={p.productSysId}
                  value={String(p.productSysId)}
                  onSelect={() => {
                    onSelect(p);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected?.productSysId === p.productSysId
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <span className="font-mono text-xs mr-2">{p.productCode}</span>
                  <span className="truncate text-sm">{p.productName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ---------- Product overrides tab ----------

interface ProductOverridesTabProps {
  onEditOverride: (
    config: LevelAssignmentConfig | undefined,
    productSysId: number,
    routeLevel: number,
  ) => void;
}

function ProductOverridesTab({ onEditOverride }: ProductOverridesTabProps) {
  const [selectedProduct, setSelectedProduct] = useState<CostProductMaster | null>(null);

  const { data: routeHead, isLoading: routeLoading } = useRouteByProduct(
    selectedProduct?.productSysId,
  );
  const { data: graph, isLoading: graphLoading } = useRouteGraph(
    routeHead?.headId ?? undefined,
  );

  // Unique sorted route levels from the product's routing graph
  const routeLevels = useMemo(() => {
    if (!graph) return [];
    const levels = [...new Set(graph.seqs.map((s) => s.routeLevel))];
    return levels.sort((a, b) => a - b);
  }, [graph]);

  const { data: globalConfigs = [] } = useGlobalFillConfigs();
  const { data: productOverrides = [] } = useProductFillConfigs(
    selectedProduct?.productSysId ?? 0,
  );

  const isLoading = routeLoading || graphLoading;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Product
        </label>
        <ProductPicker selected={selectedProduct} onSelect={setSelectedProduct} />
      </div>

      {selectedProduct && (
        <>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading routing levels…
            </div>
          ) : routeLevels.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No routing defined for this product yet. Configure the route first, then come back to set fill overrides.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Level overrides for{" "}
                <span className="font-mono">{selectedProduct.productCode}</span>
                <span className="ml-2 text-muted-foreground font-normal">
                  ({routeLevels.length} level{routeLevels.length !== 1 ? "s" : ""} from routing)
                </span>
              </p>

              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">Level</th>
                      <th className="py-3 px-4 text-left font-medium">Filler</th>
                      <th className="py-3 px-4 text-left font-medium">Approver</th>
                      <th className="py-3 px-4 text-left font-medium">SLA Fill</th>
                      <th className="py-3 px-4 text-left font-medium">SLA Approve</th>
                      <th className="py-3 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routeLevels.map((level) => {
                      const override = productOverrides.find(
                        (c) => c.routeLevel === level,
                      );
                      const global = globalConfigs.find(
                        (c) => c.routeLevel === level,
                      );
                      const hasOverride = !!override;

                      return (
                        <tr key={level} className="border-b last:border-b-0">
                          <td className="py-3 px-4 font-medium">Level {level}</td>

                          <td className="py-3 px-4">
                            {hasOverride ? (
                              <span className="text-xs font-medium text-primary">
                                {override.fillerType}: {override.fillerValue}
                              </span>
                            ) : global ? (
                              <span className="text-xs text-muted-foreground italic">
                                Global: {global.fillerType}: {global.fillerValue}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                No global default
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-xs">
                            {hasOverride ? (
                              override.approverType ? (
                                <span className="text-primary font-medium">
                                  {override.approverType}: {override.approverValue}
                                </span>
                              ) : "—"
                            ) : global?.approverType ? (
                              <span className="text-muted-foreground italic">
                                Global: {global.approverType}: {global.approverValue}
                              </span>
                            ) : "—"}
                          </td>

                          <td className="py-3 px-4 text-xs">
                            {hasOverride
                              ? `${override.slaFillHours}h`
                              : global
                                ? <span className="text-muted-foreground italic">{global.slaFillHours}h (global)</span>
                                : "—"}
                          </td>

                          <td className="py-3 px-4 text-xs">
                            {hasOverride
                              ? override.approverType ? `${override.slaApproveHours}h` : "—"
                              : global?.approverType
                                ? <span className="text-muted-foreground italic">{global.slaApproveHours}h (global)</span>
                                : "—"}
                          </td>

                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant={hasOverride ? "outline" : "secondary"}
                              onClick={() =>
                                onEditOverride(
                                  override,
                                  selectedProduct.productSysId,
                                  level,
                                )
                              }
                            >
                              {hasOverride ? "Edit Override" : "Set Override"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!selectedProduct && (
        <p className="text-sm text-muted-foreground">
          Select a product above to view its routing levels and configure overrides.
        </p>
      )}
    </div>
  );
}

// ---------- Page ----------

export default function FillConfigPage() {
  const { data: configs = [], isLoading } = useGlobalFillConfigs();
  const deleteConfig = useDeleteGlobalFillConfig();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LevelAssignmentConfig | undefined>();
  const [overrideProductSysId, setOverrideProductSysId] = useState<number | undefined>();
  const [overrideRouteLevel, setOverrideRouteLevel] = useState<number | undefined>();

  function handleEditGlobal(config: LevelAssignmentConfig) {
    setEditing(config);
    setOverrideProductSysId(undefined);
    setOverrideRouteLevel(undefined);
    setFormOpen(true);
  }

  function handleAddGlobal() {
    setEditing(undefined);
    setOverrideProductSysId(undefined);
    setOverrideRouteLevel(undefined);
    setFormOpen(true);
  }

  function handleEditOverride(
    config: LevelAssignmentConfig | undefined,
    productSysId: number,
    routeLevel: number,
  ) {
    setEditing(config);
    setOverrideProductSysId(productSysId);
    setOverrideRouteLevel(routeLevel);
    setFormOpen(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Fill Assignment Config</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure who fills and approves cost parameters per routing level.
        </p>
      </div>

      <Tabs defaultValue="global">
        <TabsList>
          <TabsTrigger value="global">Global Defaults</TabsTrigger>
          <TabsTrigger value="product">Product Overrides</TabsTrigger>
        </TabsList>

        {/* ---- Global tab ---- */}
        <TabsContent value="global" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddGlobal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Level
            </Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : configs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No global configs yet. Add one above.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium">Level</th>
                    <th className="py-3 px-4 text-left font-medium">Filler</th>
                    <th className="py-3 px-4 text-left font-medium">Approver</th>
                    <th className="py-3 px-4 text-left font-medium">SLA Fill</th>
                    <th className="py-3 px-4 text-left font-medium">SLA Approve</th>
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((c) => (
                    <tr key={c.routeLevel} className="border-b last:border-b-0">
                      <td className="py-3 px-4 font-medium">Level {c.routeLevel}</td>
                      <td className="py-3 px-4">
                        {c.fillerType}: {c.fillerValue}
                      </td>
                      <td className="py-3 px-4">
                        {c.approverType
                          ? `${c.approverType}: ${c.approverValue}`
                          : "—"}
                      </td>
                      <td className="py-3 px-4">{c.slaFillHours}h</td>
                      <td className="py-3 px-4">
                        {c.approverType ? `${c.slaApproveHours}h` : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditGlobal(c)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteConfig.mutate(c.routeLevel)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ---- Product overrides tab ---- */}
        <TabsContent value="product" className="mt-4">
          <ProductOverridesTab onEditOverride={handleEditOverride} />
        </TabsContent>
      </Tabs>

      <FillConfigForm
        key={
          overrideProductSysId !== undefined
            ? `override-${overrideProductSysId}-${overrideRouteLevel ?? "new"}`
            : editing
              ? `edit-${editing.routeLevel}`
              : "add"
        }
        open={formOpen}
        onOpenChange={setFormOpen}
        existing={editing}
        productSysId={overrideProductSysId}
        fixedRouteLevel={overrideRouteLevel}
        tier={overrideProductSysId !== undefined ? "PRODUCT" : "GLOBAL"}
      />
    </div>
  );
}
