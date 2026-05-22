"use client"

// RuleFormDialog — admin form for create/edit. Condition is a JSON object; we
// expose a simple form with a textarea for the JSON (advanced) since the
// predicate shape isn't finalized in the PRD.
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateRoutingRule, useUpdateRoutingRule } from "@/hooks/finance/use-cost-routing-rule"
import type { CostRoutingRule, RoutingActionType } from "@/types/finance/cost-routing-rule"

const schema = z.object({
  priority: z.number().int().min(1, "Priority ≥ 1"),
  condition: z.string().refine((s) => {
    try {
      JSON.parse(s)
      return true
    } catch {
      return false
    }
  }, "Must be valid JSON"),
  actionType: z.enum(["AUTO_ASSIGN", "TO_TRIAGE"]),
  actionTarget: z.string().max(100, "Max 100 chars"),
  isActive: z.boolean(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule?: CostRoutingRule | null
}

const DEFAULTS: FormValues = {
  priority: 100,
  condition: '{"all": []}',
  actionType: "TO_TRIAGE",
  actionTarget: "",
  isActive: true,
}

export function RuleFormDialog({ open, onOpenChange, rule }: Props) {
  const isEditing = !!rule
  const createMutation = useCreateRoutingRule()
  const updateMutation = useUpdateRoutingRule()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: DEFAULTS,
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      priority: rule?.priority ?? 100,
      condition: rule?.condition || '{"all": []}',
      actionType: (rule?.actionType as RoutingActionType) || "TO_TRIAGE",
      actionTarget: rule?.actionTarget || "",
      isActive: rule?.isActive ?? true,
    })
  }, [open, rule, form])

  async function onSubmit(values: FormValues) {
    try {
      if (isEditing && rule) {
        await updateMutation.mutateAsync({ ruleId: rule.ruleId, ...values })
      } else {
        await createMutation.mutateAsync(values)
      }
      onOpenChange(false)
    } catch {
      /* toast in hook */
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit rule #${rule?.ruleId}` : "New routing rule"}</DialogTitle>
          <DialogDescription>
            Rules are evaluated first-match by ascending priority. AUTO_ASSIGN routes the request to
            the target user/role; TO_TRIAGE sends it to the manual triage queue.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>Lower = evaluated earlier.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AUTO_ASSIGN">Auto assign</SelectItem>
                        <SelectItem value="TO_TRIAGE">To triage queue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="actionTarget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action target</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="user_id for AUTO_ASSIGN, or functional role (e.g. Engineering)"
                    />
                  </FormControl>
                  <FormDescription>Leave blank for TO_TRIAGE (defaults to engineering-lead triage queue).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition (JSON predicate) *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={8}
                      className="font-mono text-sm"
                      {...field}
                      placeholder='{"all":[{"field":"request_type","op":"=","value":"DEVELOPMENT"}]}'
                    />
                  </FormControl>
                  <FormDescription>
                    Evaluated against the request fields on submit. Engine reads `all`/`any`/`field`/`op`/`value`.
                    Validation here only checks JSON syntax; semantic checks happen at submit time.
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
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Inactive rules are skipped by the evaluator.</FormDescription>
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
                {isEditing ? "Save changes" : "Create rule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
