"use client"

// ProductTypeFormDialog — create + edit for cost_product_type. type_code is
// immutable after create (it's baked into every product code generated for it).
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  useCreateCostProductType,
  useUpdateCostProductType,
} from "@/hooks/finance/use-cost-product-type"
import type { CostProductType } from "@/types/finance/cost-product-type"

const createSchema = z.object({
  typeCode: z
    .string()
    .min(1, "Required")
    .max(5, "Max 5 chars")
    .regex(/^[A-Z][A-Z0-9]*$/, "Uppercase letters/digits, must start with a letter"),
  typeName: z.string().min(1, "Required").max(100, "Max 100 chars"),
  isActive: z.boolean(),
})
const editSchema = createSchema.pick({ typeName: true, isActive: true })
type FormValues = z.infer<typeof createSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  productType?: CostProductType | null
}

export function ProductTypeFormDialog({ open, onOpenChange, productType }: Props) {
  const isEditing = !!productType
  const createMutation = useCreateCostProductType()
  const updateMutation = useUpdateCostProductType()

  const form = useForm<FormValues>({
    resolver: zodResolver(isEditing ? (editSchema as never) : (createSchema as never)),
    defaultValues: { typeCode: "", typeName: "", isActive: true },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      typeCode: productType?.typeCode || "",
      typeName: productType?.typeName || "",
      isActive: productType?.isActive ?? true,
    })
  }, [open, productType, form])

  async function onSubmit(values: FormValues) {
    try {
      if (isEditing && productType) {
        await updateMutation.mutateAsync({
          typeId: productType.typeId,
          typeName: values.typeName,
          isActive: values.isActive,
        })
      } else {
        await createMutation.mutateAsync({
          typeCode: values.typeCode,
          typeName: values.typeName,
        })
      }
      onOpenChange(false)
    } catch {
      /* toast in hook */
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit ${productType?.typeCode}` : "New product type"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Type code is immutable — products created with the old code keep working."
              : "Code prefixes every product code (e.g. CSTPOY2605000001)."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="typeCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. POY"
                      disabled={isEditing}
                      className="font-mono uppercase"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>Uppercase letters + digits, max 5 chars.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="typeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Partially Oriented Yarn" />
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
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Inactive types hide from the create-product flow but existing products keep working.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
