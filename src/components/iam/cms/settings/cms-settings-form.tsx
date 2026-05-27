"use client"

import { useState, useMemo } from "react"
import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type { CMSSetting, CMSSettingUpdate } from "@/types/iam/cms-setting"
import {
  CMSSettingType,
  SETTING_TYPE_LABELS,
  SETTING_GROUP_LABELS,
} from "@/types/iam/cms-setting"
import { useCMSSettings, useBulkUpdateCMSSettings } from "@/hooks/iam/use-cms-setting"

export function CMSSettingsForm() {
  const { data, isLoading } = useCMSSettings()
  const bulkUpdateMutation = useBulkUpdateCMSSettings()
  // Only track user overrides, not the full settings state
  const [overrides, setOverrides] = useState<Record<string, string>>({})

  const settings = useMemo(() => data?.data ?? [], [data?.data])

  const groupedSettings = useMemo(() => {
    return settings.reduce<Record<string, CMSSetting[]>>((acc, setting) => {
      const group = setting.settingGroup || "general"
      if (!acc[group]) acc[group] = []
      acc[group].push(setting)
      return acc
    }, {})
  }, [settings])

  const hasChanges = settings.some(
    (s) => s.settingKey in overrides && overrides[s.settingKey] !== s.settingValue
  )

  const getDisplayValue = (setting: CMSSetting) => {
    return setting.settingKey in overrides ? overrides[setting.settingKey] : setting.settingValue
  }

  const handleValueChange = (key: string, value: string) => {
    setOverrides((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    const changedSettings: CMSSettingUpdate[] = settings
      .filter((s) => s.settingKey in overrides && overrides[s.settingKey] !== s.settingValue)
      .map((s) => ({
        settingKey: s.settingKey,
        settingValue: overrides[s.settingKey],
      }))

    if (changedSettings.length === 0) return

    await bulkUpdateMutation.mutateAsync(changedSettings)
    setOverrides({})
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (settings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No settings found. Run the seed migration to populate default settings.
      </div>
    )
  }

  const sortedGroups = Object.keys(groupedSettings).sort()

  return (
    <div className="space-y-6">
      {sortedGroups.map((group) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle>{SETTING_GROUP_LABELS[group] || group}</CardTitle>
            <CardDescription>
              {group === "general" && "Basic site configuration"}
              {group === "branding" && "Logo and visual identity"}
              {group === "social" && "Social media links"}
              {group === "footer" && "Footer content and links"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupedSettings[group].map((setting) => (
              <div key={setting.settingKey} className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={setting.settingKey}>
                    {setting.description || setting.settingKey}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {SETTING_TYPE_LABELS[setting.settingType] || "Text"}
                    {!setting.isEditable && " (read-only)"}
                  </span>
                </div>
                {renderSettingInput(setting, getDisplayValue(setting), handleValueChange)}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || bulkUpdateMutation.isPending}
        >
          {bulkUpdateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}

function renderSettingInput(
  setting: CMSSetting,
  value: string,
  onChange: (key: string, value: string) => void
) {
  const disabled = !setting.isEditable

  switch (setting.settingType) {
    case CMSSettingType.CMS_SETTING_TYPE_RICH_TEXT:
    case CMSSettingType.CMS_SETTING_TYPE_JSON:
      return (
        <Textarea
          id={setting.settingKey}
          value={value}
          onChange={(e) => onChange(setting.settingKey, e.target.value)}
          disabled={disabled}
          rows={4}
          className="font-mono text-sm"
        />
      )

    case CMSSettingType.CMS_SETTING_TYPE_IMAGE:
    case CMSSettingType.CMS_SETTING_TYPE_URL:
      return (
        <Input
          id={setting.settingKey}
          value={value}
          onChange={(e) => onChange(setting.settingKey, e.target.value)}
          disabled={disabled}
          placeholder={setting.settingType === CMSSettingType.CMS_SETTING_TYPE_IMAGE ? "https://..." : "https://..."}
        />
      )

    default:
      return (
        <Input
          id={setting.settingKey}
          value={value}
          onChange={(e) => onChange(setting.settingKey, e.target.value)}
          disabled={disabled}
        />
      )
  }
}
