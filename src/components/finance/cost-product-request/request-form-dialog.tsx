"use client"

// RequestFormDialog — three-section product request form (FR-1).
// Section 2 (Product Specification) only appears when classification = new.
// NO UUID input anywhere — uses RequestTypeCombobox + PaperTubeTypeCombobox.
import { useEffect, useMemo } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PaperTubeTypeCombobox, RequestTypeCombobox } from "@/components/finance/comboboxes"
import { useCostRequestTypes } from "@/hooks/finance/use-cost-request-type"
import { useCreateCostProductRequest, useUpdateCostProductRequest } from "@/hooks/finance/use-cost-product-request"
import type { CostProductRequest, ProductClassification, RawMaterialType, UrgencyLevel } from "@/types/finance/cost-product-request"

const schema = z.object({
  requestTypeId: z.number().int().positive("Pick a request type"),
  title: z.string().min(1, "Required").max(255, "Max 255 chars"),
  description: z.string().max(10000, "Max 10000 chars"),
  customerName: z.string().min(1, "Required").max(255, "Max 255 chars"),
  customerCode: z.string().max(50, "Max 50 chars"),
  productClassification: z.enum(["existing", "new"]),
  urgencyLevel: z.enum(["low", "medium", "high"]),
  neededByDate: z.string().max(10, "YYYY-MM-DD").regex(/^$|^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  targetVolume: z.string().max(30, "Max 30 chars"),
  targetPriceRange: z.string().max(50, "Max 50 chars"),
  // Spec — only required when classification = new, validated below.
  specRawMaterial: z.enum(["POY_BOUGHTOUT", "CHIPS_SD", "CHIPS_BRT", "CHIPS_RECYCLE", ""]).optional(),
  specProductDescription: z.string().max(5000, "Max 5000 chars").optional(),
  specShadeCustomText: z.string().max(100, "Max 100 chars").optional(),
  specPaperTubeTypeId: z.number().int().nonnegative().optional(),
  specWeightPerBobbinKg: z.string().max(20, "Max 20 chars").optional(),
  specBoxType: z.enum(["JUMBO", "NORMAL", "PALLET", ""]).optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  request?: CostProductRequest | null
}

const DEFAULTS: FormValues = {
  requestTypeId: 0,
  title: "",
  description: "",
  customerName: "",
  customerCode: "",
  productClassification: "existing",
  urgencyLevel: "medium",
  neededByDate: "",
  targetVolume: "",
  targetPriceRange: "",
  specRawMaterial: "",
  specProductDescription: "",
  specShadeCustomText: "",
  specPaperTubeTypeId: 0,
  specWeightPerBobbinKg: "",
  specBoxType: "",
}

export function RequestFormDialog({ open, onOpenChange, request }: Props) {
  const isEditing = !!request && request.status === "DRAFT"
  const createMutation = useCreateCostProductRequest()
  const updateMutation = useUpdateCostProductRequest()
  const { data: requestTypes } = useCostRequestTypes()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: DEFAULTS,
  })

  const productClassification = form.watch("productClassification")
  const requestTypeId = form.watch("requestTypeId")
  const selectedType = useMemo(
    () => (requestTypes ?? []).find((t) => t.typeId === requestTypeId),
    [requestTypes, requestTypeId],
  )

  // DEVELOPMENT always implies new classification (FR-1).
  useEffect(() => {
    if (selectedType?.code === "DEVELOPMENT" && form.getValues("productClassification") !== "new") {
      form.setValue("productClassification", "new")
    }
  }, [selectedType, form])

  useEffect(() => {
    if (!open) return
    if (request) {
      form.reset({
        requestTypeId: request.requestTypeId,
        title: request.title,
        description: request.description || "",
        customerName: request.customerName,
        customerCode: request.customerCode || "",
        productClassification: request.productClassification,
        urgencyLevel: request.urgencyLevel,
        neededByDate: request.neededByDate || "",
        targetVolume: request.targetVolume || "",
        targetPriceRange: request.targetPriceRange || "",
        specRawMaterial: (request.spec?.rawMaterialType as RawMaterialType) || "",
        specProductDescription: request.spec?.productDescription || "",
        specShadeCustomText: request.spec?.shadeCustomText || "",
        specPaperTubeTypeId: request.spec?.paperTubeTypeId || 0,
        specWeightPerBobbinKg: request.spec?.weightPerBobbinKg || "",
        specBoxType: (request.spec?.boxType as "JUMBO" | "NORMAL" | "PALLET") || "",
      })
    } else {
      form.reset(DEFAULTS)
    }
  }, [open, request, form])

  async function onSubmit(values: FormValues) {
    // Cross-field rule: spec required iff classification = new.
    if (values.productClassification === "new") {
      if (!values.specRawMaterial) {
        form.setError("specRawMaterial", { message: "Required for new products" })
        return
      }
      if (!values.specProductDescription) {
        form.setError("specProductDescription", { message: "Required for new products" })
        return
      }
      if (!values.specPaperTubeTypeId) {
        form.setError("specPaperTubeTypeId", { message: "Required for new products" })
        return
      }
      if (!values.specWeightPerBobbinKg) {
        form.setError("specWeightPerBobbinKg", { message: "Required for new products" })
        return
      }
      if (!values.specBoxType) {
        form.setError("specBoxType", { message: "Required for new products" })
        return
      }
      if (!values.specShadeCustomText) {
        form.setError("specShadeCustomText", { message: "Required (use 'natural' if unpigmented)" })
        return
      }
    }
    const payload = {
      requestTypeId: values.requestTypeId,
      title: values.title,
      description: values.description,
      customerName: values.customerName,
      customerCode: values.customerCode,
      productClassification: values.productClassification as ProductClassification,
      urgencyLevel: values.urgencyLevel as UrgencyLevel,
      neededByDate: values.neededByDate,
      targetVolume: values.targetVolume,
      targetPriceRange: values.targetPriceRange,
      spec:
        values.productClassification === "new"
          ? {
              rawMaterialType: values.specRawMaterial as RawMaterialType,
              productDescription: values.specProductDescription!,
              shadeId: 0, // master shade not picked — using free-text fallback
              shadeCustomText: values.specShadeCustomText,
              paperTubeTypeId: values.specPaperTubeTypeId!,
              weightPerBobbinKg: values.specWeightPerBobbinKg!,
              boxType: values.specBoxType as "JUMBO" | "NORMAL" | "PALLET",
            }
          : undefined,
    }
    try {
      if (isEditing && request) {
        await updateMutation.mutateAsync({ requestId: request.requestId, ...payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      /* toast in hook */
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit ${request?.requestNo}` : "New product request"}</DialogTitle>
          <DialogDescription>
            Section 2 (Product specification) becomes required when classification = new. DEVELOPMENT
            requests are forced to new.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* SECTION 1 — Request Info */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Section 1 — Request info
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requestTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request type *</FormLabel>
                      <FormControl>
                        <RequestTypeCombobox
                          value={field.value || undefined}
                          onChange={(typeId) => field.onChange(typeId)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="urgencyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Short summary of this request" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(optional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="productClassification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product classification *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-6"
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <RadioGroupItem value="existing" />
                          Existing product
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <RadioGroupItem value="new" />
                          New product
                        </label>
                      </RadioGroup>
                    </FormControl>
                    {selectedType?.code === "DEVELOPMENT" && (
                      <FormDescription>
                        DEVELOPMENT request type forces classification = new.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="neededByDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Needed by</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* SECTION 2 — Product Specification (conditional) */}
            {productClassification === "new" && (
              <section className="space-y-4 rounded-md border bg-muted/30 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Section 2 — Product specification
                </h3>
                <FormField
                  control={form.control}
                  name="specRawMaterial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raw material type *</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pick one" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="POY_BOUGHTOUT">POY Boughtout</SelectItem>
                          <SelectItem value="CHIPS_SD">Chips SD</SelectItem>
                          <SelectItem value="CHIPS_BRT">Chips BRT</SelectItem>
                          <SelectItem value="CHIPS_RECYCLE">Chips Recycle</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specProductDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product description *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Free text describing the requested product" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specShadeCustomText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shade *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. natural / biru langit / NL" />
                      </FormControl>
                      <FormDescription>
                        Use the master shade name if known, otherwise free-text. Use {`"natural"`} for unpigmented.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="specPaperTubeTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paper tube *</FormLabel>
                        <FormControl>
                          <PaperTubeTypeCombobox
                            value={field.value || undefined}
                            onChange={(id) => field.onChange(id)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specWeightPerBobbinKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight per bobbin (kg) *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. 4.5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="specBoxType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Box type *</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pick one" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="JUMBO">Jumbo</SelectItem>
                          <SelectItem value="NORMAL">Normal</SelectItem>
                          <SelectItem value="PALLET">Pallet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>
            )}

            {/* SECTION 3 — Pricing Context */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Section 3 — Pricing context
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target volume</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(optional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetPriceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target price range</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(optional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save draft" : "Create request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
