"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { CMSSection, CMSSetting, CMSPage } from "@/types/generated/iam/v1/cms"
import { CMSSectionType } from "@/types/generated/iam/v1/cms"

interface LandingContent {
  sections: CMSSection[]
  settings: CMSSetting[]
}

export function usePublicLanding() {
  return useQuery({
    queryKey: ["public", "landing"],
    queryFn: async (): Promise<LandingContent> => {
      const response = await apiClient.get<{
        sections?: CMSSection[]
        settings?: CMSSetting[]
      }>("/api/v1/public/landing")
      return {
        sections: response.sections ?? [],
        settings: response.settings ?? [],
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/** Fetch a single CMS page by slug (public endpoint). */
export function useCMSPageBySlug(slug: string) {
  return useQuery({
    queryKey: ["public", "page", slug],
    queryFn: async (): Promise<CMSPage | null> => {
      try {
        const response = await apiClient.get<{
          base?: { isSuccess: boolean }
          data?: CMSPage
        }>(`/api/v1/iam/cms/pages/slug/${slug}`)
        if (response.base?.isSuccess && response.data) {
          return response.data
        }
        return null
      } catch {
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/** Helper to get a setting value by key from the settings array. */
export function getSettingValue(settings: CMSSetting[], key: string, fallback: string = ""): string {
  const setting = settings.find((s) => s.settingKey === key)
  return setting?.settingValue || fallback
}

/** Helper to filter sections by type. */
export function getSectionsByType(sections: CMSSection[], type: CMSSectionType): CMSSection[] {
  return sections.filter((s) => s.sectionType === type).sort((a, b) => a.sortOrder - b.sortOrder)
}
