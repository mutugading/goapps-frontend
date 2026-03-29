"use client"

// CMS Section Hooks - TanStack Query hooks for CMS Section operations

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { createCrudHooks } from "@/lib/hooks"
import {
  type CMSSection,
  type CreateCMSSectionRequest,
  type UpdateCMSSectionRequest,
  type ListCMSSectionsParams,
  type ListCMSSectionsResponse,
  type CreateCMSSectionResponse,
  type UpdateCMSSectionResponse,
  type DeleteCMSSectionResponse,
  type GetCMSSectionResponse,
  ListCMSSectionsResponseParser,
  CreateCMSSectionResponseParser,
  UpdateCMSSectionResponseParser,
  DeleteCMSSectionResponseParser,
  GetCMSSectionResponseParser,
} from "@/types/iam/cms-section"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
  useList: useCMSSections,
  useGet: useCMSSection,
  useCreate: useCreateCMSSection,
  useUpdate: useUpdateCMSSection,
  useDelete: useDeleteCMSSection,
  queryKeys: cmsSectionKeys,
} = createCrudHooks<
  CMSSection,
  ListCMSSectionsParams,
  CreateCMSSectionRequest,
  UpdateCMSSectionRequest,
  ListCMSSectionsResponse,
  CreateCMSSectionResponse,
  UpdateCMSSectionResponse,
  DeleteCMSSectionResponse,
  GetCMSSectionResponse
>({
  serviceScope: "iam",
  resourceName: "cms-section",
  apiBasePath: "/api/v1/iam/cms/sections",
  parsers: {
    listResponse: (data) => ListCMSSectionsResponseParser.fromJSON(data),
    createResponse: (data) => CreateCMSSectionResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateCMSSectionResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteCMSSectionResponseParser.fromJSON(data),
    getResponse: (data) => GetCMSSectionResponseParser.fromJSON(data),
  },
  getEntityId: (section) => section.sectionId,
  messages: {
    createSuccess: "CMS section created successfully",
    updateSuccess: "CMS section updated successfully",
    deleteSuccess: "CMS section deleted successfully",
  },
  additionalInvalidateKeys: [["public", "landing"]],
})

// ============================================================================
// Upload CMS Image Hook
// ============================================================================

function useUploadCMSImage() {
  return useMutation({
    mutationFn: async ({ file, folder = "sections" }: { file: File; folder?: string }): Promise<{ imageUrl: string }> => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const res = await fetch("/api/v1/iam/cms/upload", {
        method: "POST",
        body: formData,
      })

      const response = await res.json() as {
        base?: { isSuccess: boolean; message: string }
        imageUrl?: string
      }

      if (!res.ok || !response.base?.isSuccess) {
        throw new Error(response.base?.message || "Failed to upload image")
      }

      return { imageUrl: response.imageUrl || "" }
    },
    onSuccess: () => {
      toast.success("Image uploaded successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload image")
    },
  })
}

export {
  useCMSSections,
  useCMSSection,
  useCreateCMSSection,
  useUpdateCMSSection,
  useDeleteCMSSection,
  useUploadCMSImage,
  cmsSectionKeys,
}
