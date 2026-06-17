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

import type { BoxBobbinCost } from "@/types/finance/box-bobbin-cost"
import {
  useCreateBoxBobbinCost,
  useUpdateBoxBobbinCost,
} from "@/hooks/finance/use-box-bobbin-cost"

const formSchema = z.object({
  bbcCode: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be at most 50 characters")
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      "Code must start with uppercase letter and contain only uppercase letters, numbers, and underscores"
    ),
  bbcName: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  bbcType: z.string().min(1, "Type is required").max(20),
  noOfBob: z.coerce.number().int().min(1, "Must be at least 1"),
  notes: z.string().max(1000).optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface BoxBobbinCostFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boxBobbinCost?: BoxBobbinCost | null
  onSuccess?: () => void
}

export function BoxBobbinCostFormDialog({
  open,
  onOpenChange,
  boxBobbinCost,
  onSuccess,
}: BoxBobbinCostFormDialogProps) {
  const isEditing = !!boxBobbinCost
  const createMutation = useCreateBoxBobbinCost()
  const updateMutation = useUpdateBoxBobbinCost()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      bbcCode: "",
      bbcName: "",
      bbcType: "",
      noOfBob: 24,
      notes: "",
      isActive: true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        boxBobbinCost
          ? {
              bbcCode: boxBobbinCost.bbcCode || "",
              bbcName: boxBobbinCost.bbcName || "",
              bbcType: boxBobbinCost.bbcType || "",
              noOfBob: boxBobbinCost.noOfBob ?? 24,
              notes: boxBobbinCost.notes || "",
              isActive: boxBobbinCost.isActive ?? true,
            }
          : { bbcCode: "", bbcName: "", bbcType: "", noOfBob: 24, notes: "", isActive: true }
      )
    }
  }, [open, boxBobbinCost, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && boxBobbinCost) {
        await updateMutation.mutateAsync({
          id: boxBobbinCost.bbcId,
          data: {
            bbcId: boxBobbinCost.bbcId,
            bbcName: values.bbcName,
            bbcType: values.bbcType,
            noOfBob: values.noOfBob,
            notes: values.notes || "",
            isActive: values.isActive,
          },
        })
      } else {
        await createMutation.mutateAsync({
          bbcCode: values.bbcCode,
          bbcName: values.bbcName,
          bbcType: values.bbcType,
          noOfBob: values.noOfBob,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Box Bobbin Cost" : "Add New Box Bobbin Cost"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the box bobbin cost details. Code cannot be changed."
              : "Create a new box bobbin cost record."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bbcCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., BBC001"
                      {...field}
                      value={field.value || ""}
                      disabled={isEditing || isPending}
                      className="uppercase"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>Unique code (uppercase, starts with letter)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bbcName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Box Bobbin Standard"
                      {...field}
                      value={field.value || ""}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bbcType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., CAPTIVE"
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
                name="noOfBob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Bobbins</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="Optional"
                        {...field}
                        value={field.value}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Optional notes"
                      {...field}
                      value={field.value || ""}
                      disabled={isPending}
                    />
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
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Inactive records will not be available for selection
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
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
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
