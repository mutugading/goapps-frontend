"use client"

// Dashboard wizard shell — 7-step controlled form with a sticky live-preview pane.
// Used for both create and edit (editMode + initial form provided by the page).

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCreateDashboard, useUpdateDashboard } from "@/hooks/bi/use-dashboard"
import { allChartTypes } from "@/lib/bi/chart-registry"
import { chartTypeToString, type DashboardFormData } from "@/types/bi"

import { StepBasic, StepDataBinding, StepChartType, StepFieldMapping, StepStyle, StepCompareAndKpi, StepAccess } from "./wizard-steps"
import { LivePreview } from "./live-preview"
import { buildCreateRequest, buildUpdateRequest, emptyForm, isStepValid } from "./build-request"

const STEP_LABELS = ["Basic", "Data", "Chart Type", "Field Mapping", "Style", "Compare + KPI", "Access"]

interface DashboardWizardProps {
  mode: "create" | "edit"
  dashboardId?: string
  initial?: DashboardFormData
}

export function DashboardWizard({ mode, dashboardId, initial }: DashboardWizardProps) {
  const router = useRouter()
  const [form, setFormState] = useState<DashboardFormData>(initial ?? emptyForm())
  const [step, setStep] = useState(0)

  const createMut = useCreateDashboard()
  const updateMut = useUpdateDashboard()

  const setForm = (updater: (prev: DashboardFormData) => DashboardFormData) => setFormState(updater)

  const requiredFields = useMemo(() => {
    const reg = allChartTypes().find((r) => r.type === chartTypeToString(form.chartType))
    return reg?.requiredFields ?? []
  }, [form.chartType])

  const stepValid = isStepValid(step, form, requiredFields)
  const isLast = step === STEP_LABELS.length - 1

  function next() {
    if (step < STEP_LABELS.length - 1) setStep((s) => s + 1)
  }
  function prev() {
    if (step > 0) setStep((s) => s - 1)
  }

  async function handleSave() {
    if (mode === "create") {
      await createMut.mutateAsync(buildCreateRequest(form))
    } else if (dashboardId) {
      await updateMut.mutateAsync({ id: dashboardId, data: buildUpdateRequest(form) as never })
    }
    router.push("/finance/bi/admin")
  }

  const saving = createMut.isPending || updateMut.isPending

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        {/* Step indicator */}
        <ol className="flex flex-wrap gap-2">
          {STEP_LABELS.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
                  i === step && "border-primary bg-primary text-primary-foreground",
                  i < step && "border-emerald-500 text-emerald-600"
                )}
              >
                {i < step ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
                {label}
              </button>
            </li>
          ))}
        </ol>

        {/* Active step */}
        <div className="rounded-lg border p-6">
          {step === 0 && <StepBasic form={form} setForm={setForm} />}
          {step === 1 && <StepDataBinding form={form} setForm={setForm} />}
          {step === 2 && <StepChartType form={form} setForm={setForm} />}
          {step === 3 && <StepFieldMapping form={form} setForm={setForm} />}
          {step === 4 && <StepStyle form={form} setForm={setForm} />}
          {step === 5 && <StepCompareAndKpi form={form} setForm={setForm} />}
          {step === 6 && <StepAccess form={form} setForm={setForm} />}
        </div>

        {/* Nav */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prev} disabled={step === 0}>
            Back
          </Button>
          {isLast ? (
            <Button onClick={handleSave} disabled={saving || !stepValid}>
              {saving ? "Saving…" : mode === "create" ? "Create Dashboard" : "Save Changes"}
            </Button>
          ) : (
            <Button onClick={next} disabled={!stepValid}>
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Live preview (hidden on small screens) */}
      <div className="hidden lg:block">
        <LivePreview form={form} requiredFields={requiredFields} />
      </div>
    </div>
  )
}
