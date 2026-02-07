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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import {
  type UOM,
  UOMCategory,
  UOM_CATEGORY_FORM_OPTIONS,
  uOMCategoryFromJSON,
} from "@/types/finance/uom"
import { useCreateUOM, useUpdateUOM } from "@/hooks/finance/use-uom"

// Form values interface
interface UOMFormValues {
  uomCode: string
  uomName: string
  uomCategory: number
  description: string
  isActive: boolean
}

// Valid category values (numeric enums from proto)
const validCategoryValues = [
  UOMCategory.UOM_CATEGORY_WEIGHT,
  UOMCategory.UOM_CATEGORY_LENGTH,
  UOMCategory.UOM_CATEGORY_VOLUME,
  UOMCategory.UOM_CATEGORY_QUANTITY,
]

// Form validation schema
const uomFormSchema = z.object({
  uomCode: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be at most 20 characters")
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      "Code must start with uppercase letter and contain only uppercase letters, numbers, and underscores"
    ),
  uomName: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  uomCategory: z
    .number()
    .refine(
      (val) => validCategoryValues.includes(val),
      "Please select a valid category"
    ),
  description: z.string().max(500, "Description must be at most 500 characters"),
  isActive: z.boolean(),
})

interface UOMFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uom?: UOM | null
  onSuccess?: () => void
}

export function UOMFormDialog({
  open,
  onOpenChange,
  uom,
  onSuccess,
}: UOMFormDialogProps) {
  const isEditing = !!uom
  const createMutation = useCreateUOM()
  const updateMutation = useUpdateUOM()

  const form = useForm<UOMFormValues>({
    resolver: zodResolver(uomFormSchema) as never,
    defaultValues: {
      uomCode: "",
      uomName: "",
      uomCategory: UOMCategory.UOM_CATEGORY_WEIGHT,
      description: "",
      isActive: true,
    },
  })

  // Reset form when dialog opens/closes or uom changes
  useEffect(() => {
    if (open) {
      if (uom) {
        // Editing mode - populate with existing values
        form.reset({
          uomCode: uom.uomCode || "",
          uomName: uom.uomName || "",
          uomCategory: uom.uomCategory,
          description: uom.description || "",
          isActive: uom.isActive ?? true,
        })
      } else {
        // Create mode - reset to empty
        form.reset({
          uomCode: "",
          uomName: "",
          uomCategory: UOMCategory.UOM_CATEGORY_WEIGHT,
          description: "",
          isActive: true,
        })
      }
    }
  }, [open, uom, form])

  const onSubmit = async (values: UOMFormValues) => {
    try {
      if (isEditing && uom) {
        await updateMutation.mutateAsync({
          id: uom.uomId,
          data: {
            uomId: uom.uomId,
            uomName: values.uomName,
            uomCategory: values.uomCategory,
            description: values.description || "",
            isActive: values.isActive,
          },
        })
      } else {
        await createMutation.mutateAsync({
          uomCode: values.uomCode,
          uomName: values.uomName,
          uomCategory: values.uomCategory,
          description: values.description || "",
        })
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save UOM:", error)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit UOM" : "Add New UOM"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the unit of measure details. Code cannot be changed."
              : "Create a new unit of measure for costing calculations."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="uomCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., KG, MTR, PCS"
                      {...field}
                      value={field.value || ""}
                      disabled={isEditing || isPending}
                      className="uppercase"
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Unique code (1-20 chars, uppercase, starts with letter)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="uomName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Kilogram, Meter, Pieces"
                      {...field}
                      value={field.value || ""}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>Display name (1-100 chars)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="uomCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={String(field.value)}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UOM_CATEGORY_FORM_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description (max 500 chars)
                  </FormDescription>
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
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Inactive UOMs will not be available for selection
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
