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

import type { Parameter } from "@/types/finance/parameter"
import {
  DataType,
  ParamCategory,
  DATA_TYPE_FORM_OPTIONS,
  PARAM_CATEGORY_FORM_OPTIONS,
} from "@/types/finance/parameter"
import { useCreateParameter, useUpdateParameter } from "@/hooks/finance/use-parameter"

interface ParameterFormValues {
  paramCode: string
  paramName: string
  paramShortName: string
  dataType: DataType
  paramCategory: ParamCategory
  uomId: string
  defaultValue: string
  minValue: string
  maxValue: string
  isActive: boolean
}

const parameterFormSchema = z.object({
  paramCode: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be at most 20 characters")
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      "Code must start with uppercase letter and contain only uppercase letters, numbers, and underscores"
    ),
  paramName: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be at most 200 characters"),
  paramShortName: z.string().max(50, "Short name must be at most 50 characters"),
  dataType: z.nativeEnum(DataType).refine(
    (val) => val !== DataType.DATA_TYPE_UNSPECIFIED,
    "Data type is required"
  ),
  paramCategory: z.nativeEnum(ParamCategory).refine(
    (val) => val !== ParamCategory.PARAM_CATEGORY_UNSPECIFIED,
    "Category is required"
  ),
  uomId: z.string(),
  defaultValue: z.string(),
  minValue: z.string(),
  maxValue: z.string(),
  isActive: z.boolean(),
})

interface ParameterFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parameter?: Parameter | null
  onSuccess?: () => void
}

export function ParameterFormDialog({
  open,
  onOpenChange,
  parameter,
  onSuccess,
}: ParameterFormDialogProps) {
  const isEditing = !!parameter
  const createMutation = useCreateParameter()
  const updateMutation = useUpdateParameter()

  const form = useForm<ParameterFormValues>({
    resolver: zodResolver(parameterFormSchema) as never,
    defaultValues: {
      paramCode: "",
      paramName: "",
      paramShortName: "",
      dataType: DataType.DATA_TYPE_NUMBER,
      paramCategory: ParamCategory.PARAM_CATEGORY_INPUT,
      uomId: "",
      defaultValue: "",
      minValue: "",
      maxValue: "",
      isActive: true,
    },
  })

  useEffect(() => {
    if (open) {
      if (parameter) {
        form.reset({
          paramCode: parameter.paramCode || "",
          paramName: parameter.paramName || "",
          paramShortName: parameter.paramShortName || "",
          dataType: parameter.dataType || DataType.DATA_TYPE_NUMBER,
          paramCategory: parameter.paramCategory || ParamCategory.PARAM_CATEGORY_INPUT,
          uomId: parameter.uomId || "",
          defaultValue: parameter.defaultValue || "",
          minValue: parameter.minValue || "",
          maxValue: parameter.maxValue || "",
          isActive: parameter.isActive ?? true,
        })
      } else {
        form.reset({
          paramCode: "",
          paramName: "",
          paramShortName: "",
          dataType: DataType.DATA_TYPE_NUMBER,
          paramCategory: ParamCategory.PARAM_CATEGORY_INPUT,
          uomId: "",
          defaultValue: "",
          minValue: "",
          maxValue: "",
          isActive: true,
        })
      }
    }
  }, [open, parameter, form])

  const onSubmit = async (values: ParameterFormValues) => {
    try {
      if (isEditing && parameter) {
        await updateMutation.mutateAsync({
          id: parameter.paramId,
          data: {
            paramId: parameter.paramId,
            paramName: values.paramName,
            paramShortName: values.paramShortName,
            dataType: values.dataType,
            paramCategory: values.paramCategory,
            uomId: values.uomId || undefined,
            defaultValue: values.defaultValue || undefined,
            minValue: values.minValue || undefined,
            maxValue: values.maxValue || undefined,
            isActive: values.isActive,
          },
        })
      } else {
        await createMutation.mutateAsync({
          paramCode: values.paramCode,
          paramName: values.paramName,
          paramShortName: values.paramShortName,
          dataType: values.dataType,
          paramCategory: values.paramCategory,
          uomId: values.uomId || "",
          defaultValue: values.defaultValue || "",
          minValue: values.minValue || "",
          maxValue: values.maxValue || "",
        })
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save Parameter:", error)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Parameter" : "Add New Parameter"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the parameter details. Code cannot be changed."
              : "Create a new parameter for costing calculations."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paramCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., SPEED, DENIER, ELEC_RATE"
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="paramName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Speed, Denier"
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
                name="paramShortName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Spd, Den (optional)"
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="dataType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Type</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={String(field.value)}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select data type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DATA_TYPE_FORM_OPTIONS.map((option) => (
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
                name="paramCategory"
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
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PARAM_CATEGORY_FORM_OPTIONS.map((option) => (
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
            </div>

            <FormField
              control={form.control}
              name="uomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UOM (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="UOM ID (UUID, leave empty if not applicable)"
                      {...field}
                      value={field.value || ""}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Reference to a Unit of Measure (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="defaultValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Value</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 100.5"
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
                name="minValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Value</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 0"
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
                name="maxValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Value</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 9999"
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

            {isEditing && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Inactive parameters will not be available for selection
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
