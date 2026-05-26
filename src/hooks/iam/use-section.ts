"use client"

import { createCrudHooks } from "@/lib/hooks"
import {
  type Section,
  type CreateSectionRequest,
  type UpdateSectionRequest,
  type ListSectionsParams,
  type ListSectionsResponse,
  type CreateSectionResponse,
  type UpdateSectionResponse,
  type DeleteSectionResponse,
  type GetSectionResponse,
  ListSectionsResponseParser,
  CreateSectionResponseParser,
  UpdateSectionResponseParser,
  DeleteSectionResponseParser,
  GetSectionResponseParser,
} from "@/types/iam/section"

const {
  useList: useSections,
  useGet: useSection,
  useCreate: useCreateSection,
  useUpdate: useUpdateSection,
  useDelete: useDeleteSection,
  queryKeys: sectionKeys,
} = createCrudHooks<
  Section,
  ListSectionsParams,
  CreateSectionRequest,
  UpdateSectionRequest,
  ListSectionsResponse,
  CreateSectionResponse,
  UpdateSectionResponse,
  DeleteSectionResponse,
  GetSectionResponse
>({
  serviceScope: "iam",
  resourceName: "section",
  apiBasePath: "/api/v1/iam/sections",
  parsers: {
    listResponse: (data) => ListSectionsResponseParser.fromJSON(data),
    createResponse: (data) => CreateSectionResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateSectionResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteSectionResponseParser.fromJSON(data),
    getResponse: (data) => GetSectionResponseParser.fromJSON(data),
  },
  getEntityId: (entity) => entity.sectionId,
  messages: {
    createSuccess: "Section created successfully",
    updateSuccess: "Section updated successfully",
    deleteSuccess: "Section deleted successfully",
  },
})

export {
  useSections,
  useSection,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  sectionKeys,
}
