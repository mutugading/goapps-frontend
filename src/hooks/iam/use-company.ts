"use client"

// Company Hooks - TanStack Query hooks for Company operations

import { createCrudHooks } from "@/lib/hooks"
import {
  type Company,
  type CreateCompanyRequest,
  type UpdateCompanyRequest,
  type ListCompaniesParams,
  type ListCompaniesResponse,
  type CreateCompanyResponse,
  type UpdateCompanyResponse,
  type DeleteCompanyResponse,
  type GetCompanyResponse,
  ListCompaniesResponseParser,
  CreateCompanyResponseParser,
  UpdateCompanyResponseParser,
  DeleteCompanyResponseParser,
  GetCompanyResponseParser,
} from "@/types/iam/company"

const {
  useList: useCompanies,
  useGet: useCompany,
  useCreate: useCreateCompany,
  useUpdate: useUpdateCompany,
  useDelete: useDeleteCompany,
  queryKeys: companyKeys,
} = createCrudHooks<
  Company,
  ListCompaniesParams,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  ListCompaniesResponse,
  CreateCompanyResponse,
  UpdateCompanyResponse,
  DeleteCompanyResponse,
  GetCompanyResponse
>({
  serviceScope: "iam",
  resourceName: "company",
  apiBasePath: "/api/v1/iam/companies",
  parsers: {
    listResponse: (data) => ListCompaniesResponseParser.fromJSON(data),
    createResponse: (data) => CreateCompanyResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateCompanyResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteCompanyResponseParser.fromJSON(data),
    getResponse: (data) => GetCompanyResponseParser.fromJSON(data),
  },
  getEntityId: (entity) => entity.companyId,
  messages: {
    createSuccess: "Company created successfully",
    updateSuccess: "Company updated successfully",
    deleteSuccess: "Company deleted successfully",
  },
})

export {
  useCompanies,
  useCompany,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  companyKeys,
}
