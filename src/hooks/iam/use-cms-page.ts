"use client"

// CMS Page Hooks - TanStack Query hooks for CMS Page operations

import { createCrudHooks } from "@/lib/hooks"
import {
  type CMSPage,
  type CreateCMSPageRequest,
  type UpdateCMSPageRequest,
  type ListCMSPagesParams,
  type ListCMSPagesResponse,
  type CreateCMSPageResponse,
  type UpdateCMSPageResponse,
  type DeleteCMSPageResponse,
  type GetCMSPageResponse,
  ListCMSPagesResponseParser,
  CreateCMSPageResponseParser,
  UpdateCMSPageResponseParser,
  DeleteCMSPageResponseParser,
  GetCMSPageResponseParser,
} from "@/types/iam/cms-page"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
  useList: useCMSPages,
  useGet: useCMSPage,
  useCreate: useCreateCMSPage,
  useUpdate: useUpdateCMSPage,
  useDelete: useDeleteCMSPage,
  queryKeys: cmsPageKeys,
} = createCrudHooks<
  CMSPage,
  ListCMSPagesParams,
  CreateCMSPageRequest,
  UpdateCMSPageRequest,
  ListCMSPagesResponse,
  CreateCMSPageResponse,
  UpdateCMSPageResponse,
  DeleteCMSPageResponse,
  GetCMSPageResponse
>({
  serviceScope: "iam",
  resourceName: "cms-page",
  apiBasePath: "/api/v1/iam/cms/pages",
  parsers: {
    listResponse: (data) => ListCMSPagesResponseParser.fromJSON(data),
    createResponse: (data) => CreateCMSPageResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateCMSPageResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteCMSPageResponseParser.fromJSON(data),
    getResponse: (data) => GetCMSPageResponseParser.fromJSON(data),
  },
  getEntityId: (page) => page.pageId,
  messages: {
    createSuccess: "CMS page created successfully",
    updateSuccess: "CMS page updated successfully",
    deleteSuccess: "CMS page deleted successfully",
  },
  additionalInvalidateKeys: [["public", "landing"]],
})

export {
  useCMSPages,
  useCMSPage,
  useCreateCMSPage,
  useUpdateCMSPage,
  useDeleteCMSPage,
  cmsPageKeys,
}
