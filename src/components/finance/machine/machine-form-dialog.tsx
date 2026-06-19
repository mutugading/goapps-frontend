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
import { Switch } from "@/components/ui/switch"

import type { Machine } from "@/types/finance/machine"
import { useCreateMachine, useUpdateMachine } from "@/hooks/finance/use-machine"

const formSchema = z.object({
  machineCode: z
    .string()
    .min(1, "Code is required")
    .max(30)
    .regex(/^[A-Z][A-Z0-9_-]*$/, "Uppercase, digits, hyphens or underscores"),
  machineName: z.string().min(1, "Name is required").max(100),
  mcType: z.string().max(30).optional(),
  mcLocation: z.string().max(100).optional(),
  noOfPosition: z.coerce.number().int().min(0).default(0),
  noOfEnd: z.coerce.number().int().min(1).default(1),
  mcSpeed: z.coerce.number().min(0).default(0),
  mcEfficiency: z.coerce.number().min(0).max(100).default(95),
  machineRpm: z.coerce.number().min(0).optional().nullable(),
  powerPerDay: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(500).optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface MachineFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  machine?: Machine | null
  onSuccess?: () => void
}

export function MachineFormDialog({ open, onOpenChange, machine, onSuccess }: MachineFormDialogProps) {
  const isEditing = !!machine
  const createMutation = useCreateMachine()
  const updateMutation = useUpdateMachine()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      machineCode: "", machineName: "", mcType: "", mcLocation: "",
      noOfPosition: 0, noOfEnd: 1, mcSpeed: 0, mcEfficiency: 95,
      machineRpm: null, powerPerDay: null, notes: "", isActive: true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        machine
          ? {
              machineCode: machine.machineCode,
              machineName: machine.machineName,
              mcType: machine.mcType || "",
              mcLocation: machine.mcLocation || "",
              noOfPosition: machine.noOfPosition ?? 0,
              noOfEnd: machine.noOfEnd ?? 1,
              mcSpeed: machine.mcSpeed ?? 0,
              mcEfficiency: machine.mcEfficiency ?? 95,
              machineRpm: machine.machineRpm ?? null,
              powerPerDay: machine.powerPerDay ?? null,
              notes: machine.notes || "",
              isActive: machine.isActive ?? true,
            }
          : {
              machineCode: "", machineName: "", mcType: "", mcLocation: "",
              noOfPosition: 0, noOfEnd: 1, mcSpeed: 0, mcEfficiency: 95,
              machineRpm: null, powerPerDay: null, notes: "", isActive: true,
            }
      )
    }
  }, [open, machine, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && machine) {
        await updateMutation.mutateAsync({
          id: machine.machineId,
          data: {
            machineId: machine.machineId,
            machineName: values.machineName,
            mcType: values.mcType,
            mcLocation: values.mcLocation,
            noOfPosition: values.noOfPosition,
            noOfEnd: values.noOfEnd,
            mcSpeed: values.mcSpeed,
            mcEfficiency: values.mcEfficiency,
            machineRpm: values.machineRpm ?? undefined,
            powerPerDay: values.powerPerDay ?? undefined,
            notes: values.notes,
            isActive: values.isActive,
          },
        })
      } else {
        await createMutation.mutateAsync({
          machineCode: values.machineCode,
          machineName: values.machineName,
          mcType: values.mcType || "",
          mcLocation: values.mcLocation || "",
          noOfPosition: values.noOfPosition,
          noOfEnd: values.noOfEnd,
          mcSpeed: values.mcSpeed,
          mcEfficiency: values.mcEfficiency,
          machineRpm: values.machineRpm ?? undefined,
          powerPerDay: values.powerPerDay ?? undefined,
          notes: values.notes || "",
        })
      }
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // toast handled in hook
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Machine" : "Add Machine"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update machine details." : "Create a new machine master record."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="machineCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="BT-D" disabled={isEditing || isPending}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="machineName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Barmag DTY Line D" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mcType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="DTY / POY / FDY" disabled={isPending}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mcLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Plant A / Floor 2" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="noOfPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Positions</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" step="1" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="noOfEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ends</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" step="1" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mcSpeed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Speed (m/min)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" step="0.01" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mcEfficiency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Efficiency (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" max="100" step="0.1" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="machineRpm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine RPM <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g., 3000"
                        disabled={isPending}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="powerPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Power/Day (USD) <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g., 120.00"
                        disabled={isPending}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional notes" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Inactive machines are excluded from costing.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
