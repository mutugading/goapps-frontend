"use client"

import { createCrudHooks } from "@/lib/hooks"
import {
  type Division,
  type CreateDivisionRequest,
  type UpdateDivisionRequest,
  type ListDivisionsParams,
  type ListDivisionsResponse,
  type CreateDivisionResponse,
  type UpdateDivisionResponse,
  type DeleteDivisionResponse,
  type GetDivisionResponse,
  ListDivisionsResponseParser,
  CreateDivisionResponseParser,
  UpdateDivisionResponseParser,
  DeleteDivisionResponseParser,
  GetDivisionResponseParser,
} from "@/types/iam/division"

const {
  useList: useDivisions,
  useGet: useDivision,
  useCreate: useCreateDivision,
  useUpdate: useUpdateDivision,
  useDelete: useDeleteDivision,
  queryKeys: divisionKeys,
} = createCrudHooks<
  Division,
  ListDivisionsParams,
  CreateDivisionRequest,
  UpdateDivisionRequest,
  ListDivisionsResponse,
  CreateDivisionResponse,
  UpdateDivisionResponse,
  DeleteDivisionResponse,
  GetDivisionResponse
>({
  serviceScope: "iam",
  resourceName: "division",
  apiBasePath: "/api/v1/iam/divisions",
  parsers: {
    listResponse: (data) => ListDivisionsResponseParser.fromJSON(data),
    createResponse: (data) => CreateDivisionResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateDivisionResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteDivisionResponseParser.fromJSON(data),
    getResponse: (data) => GetDivisionResponseParser.fromJSON(data),
  },
  getEntityId: (entity) => entity.divisionId,
  messages: {
    createSuccess: "Division created successfully",
    updateSuccess: "Division updated successfully",
    deleteSuccess: "Division deleted successfully",
  },
})

export {
  useDivisions,
  useDivision,
  useCreateDivision,
  useUpdateDivision,
  useDeleteDivision,
  divisionKeys,
}
