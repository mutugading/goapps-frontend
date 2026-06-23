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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import type { CostErpItem } from "@/types/finance/cost-erp"
import { ERP_ITEM_TYPE_OPTIONS } from "@/types/finance/cost-erp"
import { useCreateErpItem, useUpdateErpItem } from "@/hooks/finance/use-cost-erp"

const formSchema = z.object({
  itemCode: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be at most 20 characters"),
  itemName: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  itemType: z.string().max(10, "Type must be at most 10 characters"),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface ErpItemFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: CostErpItem | null
  onSuccess?: () => void
}

export function ErpItemFormDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: ErpItemFormDialogProps) {
  const isEditing = !!item
  const createMutation = useCreateErpItem()
  const updateMutation = useUpdateErpItem()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      itemCode: "",
      itemName: "",
      itemType: "",
      isActive: true,
    },
  })

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          itemCode: item.itemCode || "",
          itemName: item.itemName || "",
          itemType: item.itemType || "",
          isActive: item.isActive ?? true,
        })
      } else {
        form.reset({ itemCode: "", itemName: "", itemType: "", isActive: true })
      }
    }
  }, [open, item, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && item) {
        await updateMutation.mutateAsync({
          itemId: item.itemId,
          data: {
            itemName: values.itemName,
            itemType: values.itemType || undefined,
            isActive: values.isActive,
          },
        })
      } else {
        await createMutation.mutateAsync({
          itemCode: values.itemCode,
          itemName: values.itemName,
          itemType: values.itemType,
          isActive: values.isActive,
        })
      }
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // toast is handled inside the mutation hook
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit ERP Item" : "Add New ERP Item"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the ERP item details. Code cannot be changed."
              : "Create a new ERP item for the costing system."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="itemCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Code <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., FG001, RM-POLYESTER"
                      {...field}
                      value={field.value || ""}
                      disabled={isEditing || isPending}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>Unique item code (max 20 chars)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Polyester Yarn 75D"
                      {...field}
                      value={field.value || ""}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>Display name (max 255 chars)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="itemType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Type</FormLabel>
                  <Select
                    value={field.value || "none"}
                    onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {ERP_ITEM_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Classification of the item</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Inactive items will not be available for selection in costing
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
