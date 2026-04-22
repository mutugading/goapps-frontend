"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

import type { RMGroupHead, UpdateRMGroupRequest } from "@/types/finance/rm-group"
import {
  RM_GROUP_FLAG_OPTIONS,
  type RMGroupFormData,
  DEFAULT_RM_GROUP_FORM_VALUES,
} from "@/types/finance/rm-group"
import { RMGroupFlag } from "@/types/generated/finance/v1/rm_group"
import { useCreateRMGroup, useUpdateRMGroup } from "@/hooks/finance/use-rm-group"

// Validation schema: if any flag is INIT, corresponding init_val is required
const groupFormSchema = z
  .object({
    groupCode: z
      .string()
      .min(1, "Code is required")
      .max(30, "Code must be at most 30 characters"),
    groupName: z
      .string()
      .min(1, "Name is required")
      .max(200, "Name must be at most 200 characters"),
    description: z.string().max(500, "Description must be at most 500 characters"),
    colourant: z.string().max(30).optional(),
    ciName: z.string().max(30).optional(),
    costPercentage: z.coerce.number().min(0, "Must be >= 0"),
    costPerKg: z.coerce.number().min(0, "Must be >= 0"),
    flagValuation: z.nativeEnum(RMGroupFlag),
    flagMarketing: z.nativeEnum(RMGroupFlag),
    flagSimulation: z.nativeEnum(RMGroupFlag),
    initValValuation: z.coerce.number().nullable(),
    initValMarketing: z.coerce.number().nullable(),
    initValSimulation: z.coerce.number().nullable(),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.flagValuation === RMGroupFlag.RM_GROUP_FLAG_INIT && (data.initValValuation === null || data.initValValuation === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Init value required when flag is INIT",
        path: ["initValValuation"],
      })
    }
    if (data.flagMarketing === RMGroupFlag.RM_GROUP_FLAG_INIT && (data.initValMarketing === null || data.initValMarketing === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Init value required when flag is INIT",
        path: ["initValMarketing"],
      })
    }
    if (data.flagSimulation === RMGroupFlag.RM_GROUP_FLAG_INIT && (data.initValSimulation === null || data.initValSimulation === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Init value required when flag is INIT",
        path: ["initValSimulation"],
      })
    }
  })

interface GroupFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: RMGroupHead | null
  /** Called with the new/updated group head ID on success */
  onSuccess?: (groupHeadId: string) => void
}

export function GroupFormDialog({
  open,
  onOpenChange,
  group,
  onSuccess,
}: GroupFormDialogProps) {
  const isEditing = !!group
  const createMutation = useCreateRMGroup()
  const updateMutation = useUpdateRMGroup()

  const form = useForm<RMGroupFormData>({
    resolver: zodResolver(groupFormSchema) as never,
    defaultValues: DEFAULT_RM_GROUP_FORM_VALUES,
  })

  const watchFlagValuation = form.watch("flagValuation")
  const watchFlagMarketing = form.watch("flagMarketing")
  const watchFlagSimulation = form.watch("flagSimulation")

  useEffect(() => {
    if (open) {
      if (group) {
        form.reset({
          groupCode: group.groupCode || "",
          groupName: group.groupName || "",
          description: group.description || "",
          colourant: group.colourant || "",
          ciName: group.ciName || "",
          costPercentage: group.costPercentage ?? 0,
          costPerKg: group.costPerKg ?? 0,
          flagValuation: group.flagValuation ?? RMGroupFlag.RM_GROUP_FLAG_CONS,
          flagMarketing: group.flagMarketing ?? RMGroupFlag.RM_GROUP_FLAG_CONS,
          flagSimulation: group.flagSimulation ?? RMGroupFlag.RM_GROUP_FLAG_CONS,
          initValValuation: group.initValValuation ?? null,
          initValMarketing: group.initValMarketing ?? null,
          initValSimulation: group.initValSimulation ?? null,
          isActive: group.isActive ?? true,
        })
      } else {
        form.reset(DEFAULT_RM_GROUP_FORM_VALUES)
      }
    }
  }, [open, group, form])

  const onSubmit = async (values: RMGroupFormData) => {
    try {
      if (isEditing && group) {
        // Update: send all fields including flags + clearInitVal* booleans
        const updateData: UpdateRMGroupRequest = {
          groupHeadId: group.groupHeadId,
          groupName: values.groupName,
          description: values.description || "",
          colourant: values.colourant || "",
          ciName: values.ciName || "",
          costPercentage: values.costPercentage,
          costPerKg: values.costPerKg,
          flagValuation: values.flagValuation,
          flagMarketing: values.flagMarketing,
          flagSimulation: values.flagSimulation,
          isActive: values.isActive,
          initValValuation: values.initValValuation ?? undefined,
          initValMarketing: values.initValMarketing ?? undefined,
          initValSimulation: values.initValSimulation ?? undefined,
          clearInitValValuation: values.flagValuation !== RMGroupFlag.RM_GROUP_FLAG_INIT,
          clearInitValMarketing: values.flagMarketing !== RMGroupFlag.RM_GROUP_FLAG_INIT,
          clearInitValSimulation: values.flagSimulation !== RMGroupFlag.RM_GROUP_FLAG_INIT,
        }
        await updateMutation.mutateAsync({
          id: group.groupHeadId,
          data: updateData,
        })
        onOpenChange(false)
        onSuccess?.(group.groupHeadId)
      } else {
        // Create: proto CreateRMGroupRequest only supports basic fields.
        // Step 1: Create with basic fields
        const created = await createMutation.mutateAsync({
          groupCode: values.groupCode,
          groupName: values.groupName,
          description: values.description || "",
          colourant: values.colourant || "",
          ciName: values.ciName || "",
          costPercentage: values.costPercentage,
          costPerKg: values.costPerKg,
        })

        const newId = created?.groupHeadId
        if (!newId) {
          throw new Error("Create succeeded but no group ID returned")
        }

        // Step 2: Immediately update with flags + init values
        // (only if user changed flags from defaults or set init values)
        const needsFlagUpdate =
          values.flagValuation !== RMGroupFlag.RM_GROUP_FLAG_CONS ||
          values.flagMarketing !== RMGroupFlag.RM_GROUP_FLAG_CONS ||
          values.flagSimulation !== RMGroupFlag.RM_GROUP_FLAG_CONS ||
          values.initValValuation !== null ||
          values.initValMarketing !== null ||
          values.initValSimulation !== null

        if (needsFlagUpdate) {
          await updateMutation.mutateAsync({
            id: newId,
            data: {
              groupHeadId: newId,
              flagValuation: values.flagValuation,
              flagMarketing: values.flagMarketing,
              flagSimulation: values.flagSimulation,
              initValValuation: values.initValValuation ?? undefined,
              initValMarketing: values.initValMarketing ?? undefined,
              initValSimulation: values.initValSimulation ?? undefined,
              clearInitValValuation: values.flagValuation !== RMGroupFlag.RM_GROUP_FLAG_INIT,
              clearInitValMarketing: values.flagMarketing !== RMGroupFlag.RM_GROUP_FLAG_INIT,
              clearInitValSimulation: values.flagSimulation !== RMGroupFlag.RM_GROUP_FLAG_INIT,
            },
          })
        }

        onOpenChange(false)
        onSuccess?.(newId)
      }
    } catch (error) {
      console.error("Failed to save RM Group:", error)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>{isEditing ? "Edit RM Group" : "Add New RM Group"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the RM group configuration. Code cannot be changed."
              : "Create a new RM group for cost calculation. After saving, you'll be taken to the group detail page to add items."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form
              id="group-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <FormField
                  control={form.control}
                  name="groupCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., GRP-CHIPS"
                          {...field}
                          value={field.value || ""}
                          disabled={isEditing || isPending}
                          className="uppercase font-mono"
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Uppercase, digits, hyphens, spaces (e.g. BLUE MGTS-5109)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="groupName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Chips Group A"
                          {...field}
                          value={field.value || ""}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional description..."
                        {...field}
                        value={field.value || ""}
                        disabled={isPending}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <FormField
                  control={form.control}
                  name="colourant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colourant</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Colourant code"
                          {...field}
                          value={field.value || ""}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ciName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CI Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="CI name"
                          {...field}
                          value={field.value || ""}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Cost Parameters */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Cost Parameters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="costPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Percentage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.000001"
                            placeholder="0.20"
                            {...field}
                            value={field.value ?? ""}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>e.g. 0.20 for 20%</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="costPerKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost per Kg</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.000001"
                            placeholder="0.0125"
                            {...field}
                            value={field.value ?? ""}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          e.g. Rp 200 / kurs 16000 = 0.0125
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Flag Configuration — shown for BOTH create and edit */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    Flag Configuration
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Select which stage rate to use for each cost purpose. Choose
                    INIT to override with a fixed value.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 items-start">
                  {/* Valuation */}
                  <FormField
                    control={form.control}
                    name="flagValuation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valuation Flag</FormLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(v) => field.onChange(Number(v))}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select flag" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RM_GROUP_FLAG_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={String(opt.value)}
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="min-h-0 sm:min-h-[80px]">
                    {watchFlagValuation === RMGroupFlag.RM_GROUP_FLAG_INIT && (
                      <FormField
                        control={form.control}
                        name="initValValuation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Init Value (Valuation)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.000001"
                                placeholder="13000"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : null
                                  )
                                }
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormDescription>
                              Override rate value for valuation cost
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Marketing */}
                  <FormField
                    control={form.control}
                    name="flagMarketing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marketing Flag</FormLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(v) => field.onChange(Number(v))}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select flag" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RM_GROUP_FLAG_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={String(opt.value)}
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="min-h-0 sm:min-h-[80px]">
                    {watchFlagMarketing === RMGroupFlag.RM_GROUP_FLAG_INIT && (
                      <FormField
                        control={form.control}
                        name="initValMarketing"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Init Value (Marketing)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.000001"
                                placeholder="13000"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : null
                                  )
                                }
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormDescription>
                              Override rate value for marketing cost
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Simulation */}
                  <FormField
                    control={form.control}
                    name="flagSimulation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Simulation Flag</FormLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(v) => field.onChange(Number(v))}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select flag" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RM_GROUP_FLAG_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={String(opt.value)}
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="min-h-0 sm:min-h-[80px]">
                    {watchFlagSimulation ===
                      RMGroupFlag.RM_GROUP_FLAG_INIT && (
                      <FormField
                        control={form.control}
                        name="initValSimulation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Init Value (Simulation)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.000001"
                                placeholder="13000"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : null
                                  )
                                }
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormDescription>
                              Override rate value for simulation cost
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Active status — only on edit */}
              {isEditing && (
                <>
                  <Separator />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Active Status
                          </FormLabel>
                          <FormDescription>
                            Inactive groups are excluded from cost calculations
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? true}
                            onCheckedChange={field.onChange}
                            disabled={isPending}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
            </form>
          </Form>
        </div>

        <DialogFooter className="p-6 border-t bg-muted/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="group-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update" : "Create & Go to Details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
