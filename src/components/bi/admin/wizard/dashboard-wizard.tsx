"use client"

// Dashboard wizard shell — 7-step (create) or 7-step (edit) controlled form with a sticky live-preview pane.
// In create mode an optional 8th step ("Sidebar") lets the user add the dashboard to the navigation.
// Used for both create and edit (editMode + initial form provided by the page).

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCreateDashboard, useUpdateDashboard } from "@/hooks/bi/use-dashboard"
import { allChartTypes } from "@/lib/bi/chart-registry"
import { chartTypeToString, type DashboardFormData } from "@/types/bi"

import { StepBasic, StepDataBinding, StepChartType, StepFieldMapping, StepStyle, StepCompareAndKpi, StepAccess, StepSidebar } from "./wizard-steps"
import { LivePreview } from "./live-preview"
import { buildCreateRequest, buildUpdateRequest, emptyForm, isStepValid } from "./build-request"

const BASE_STEP_LABELS = ["Basic", "Data", "Chart Type", "Field Mapping", "Style", "Compare + KPI", "Access"]
const CREATE_STEP_LABELS = [...BASE_STEP_LABELS, "Sidebar"]

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

  // In create mode show 8 steps (including optional Sidebar step); edit stays at 7.
  const STEP_LABELS = mode === "create" ? CREATE_STEP_LABELS : BASE_STEP_LABELS

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
      const created = await createMut.mutateAsync(buildCreateRequest(form))
      // If user opted to add to sidebar, call the BFF endpoint now.
      if (form.addToSidebar && created?.dashboardId) {
        try {
          await fetch(`/api/v1/finance/bi/dashboards/${created.dashboardId}/add-to-sidebar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              menuTitle: form.sidebarTitle || form.dashboardTitle,
              menuIcon: form.sidebarIcon || "BarChart2",
              sortOrder: 50,
            }),
          })
        } catch {
          toast.warning("Dashboard created but failed to add to sidebar. Use the list action to retry.")
        }
      }
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
          {step === 7 && mode === "create" && <StepSidebar form={form} setForm={setForm} />}
        </div>

        {/* Nav */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prev} disabled={step === 0}>
            Back
          </Button>
          {isLast ? (
            <Button onClick={() => void handleSave()} disabled={saving || !stepValid}>
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
