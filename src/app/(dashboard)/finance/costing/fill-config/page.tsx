"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import {
  useGlobalFillConfigs,
  useDeleteGlobalFillConfig,
} from "@/hooks/finance/use-fill-assignment";
import { FillConfigForm } from "@/components/finance/fill-assignment/FillConfigForm";
import { type LevelAssignmentConfig } from "@/types/finance/fill-assignment";

export default function FillConfigPage() {
  const { data: configs = [], isLoading } = useGlobalFillConfigs();
  const deleteConfig = useDeleteGlobalFillConfig();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LevelAssignmentConfig | undefined>();

  function handleEdit(config: LevelAssignmentConfig) {
    setEditing(config);
    setFormOpen(true);
  }

  function handleAdd() {
    setEditing(undefined);
    setFormOpen(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fill Assignment Config</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure who fills and approves cost parameters per routing level.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Level
        </Button>
      </div>

      <Tabs defaultValue="global">
        <TabsList>
          <TabsTrigger value="global">Global Defaults</TabsTrigger>
          <TabsTrigger value="product">Product Overrides</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-4">
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
                    <tr key={c.routeLevel} className="border-b">
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
                            onClick={() => handleEdit(c)}
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

        <TabsContent value="product" className="mt-4">
          <p className="text-sm text-muted-foreground">
            Per-product level overrides are managed from the Product Master detail page.
          </p>
        </TabsContent>
      </Tabs>

      <FillConfigForm
        open={formOpen}
        onOpenChange={setFormOpen}
        existing={editing}
      />
    </div>
  );
}
