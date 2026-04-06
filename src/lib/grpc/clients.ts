// Singleton gRPC client registry using globalThis pattern (survives HMR)

import * as grpc from "@grpc/grpc-js"
import { createServiceClient } from "./service-client"

// Service definitions
import { AuthServiceDefinition } from "@/types/generated/iam/v1/auth"
import { UserServiceDefinition } from "@/types/generated/iam/v1/user"
import { MenuServiceDefinition } from "@/types/generated/iam/v1/menu"
import { RoleServiceDefinition, PermissionServiceDefinition } from "@/types/generated/iam/v1/role"
import { SessionServiceDefinition } from "@/types/generated/iam/v1/session"
import { AuditServiceDefinition } from "@/types/generated/iam/v1/audit"
import {
  CompanyServiceDefinition,
  DivisionServiceDefinition,
  DepartmentServiceDefinition,
  SectionServiceDefinition,
  OrganizationServiceDefinition,
} from "@/types/generated/iam/v1/organization"
import { UOMServiceDefinition } from "@/types/generated/finance/v1/uom"
import { RMCategoryServiceDefinition } from "@/types/generated/finance/v1/rm_category"
import { ParameterServiceDefinition } from "@/types/generated/finance/v1/parameter"
import {
  CMSPageServiceDefinition,
  CMSSectionServiceDefinition,
  CMSSettingServiceDefinition,
} from "@/types/generated/iam/v1/cms"

const CHANNEL_OPTIONS = {
  "grpc.keepalive_time_ms": 10000,
  "grpc.keepalive_timeout_ms": 5000,
  "grpc.keepalive_permit_without_calls": 1,
  "grpc.max_reconnect_backoff_ms": 10000,
  "grpc.initial_reconnect_backoff_ms": 1000,
  "grpc.max_receive_message_length": 10 * 1024 * 1024,
  "grpc.max_send_message_length": 10 * 1024 * 1024,
  "grpc.enable_retries": 1,
}

const SERVICE_ADDRESSES = {
  iam: `${process.env.IAM_GRPC_HOST || "localhost"}:${process.env.IAM_GRPC_PORT || "50052"}`,
  finance: `${process.env.FINANCE_GRPC_HOST || "localhost"}:${process.env.FINANCE_GRPC_PORT || "50051"}`,
}

// Type-safe global store for clients (survives HMR)
const globalStore = globalThis as unknown as {
  __grpcClients?: Record<string, unknown>
}

function getOrCreate<T>(key: string, factory: () => T): T {
  if (!globalStore.__grpcClients) {
    globalStore.__grpcClients = {}
  }
  if (!globalStore.__grpcClients[key]) {
    globalStore.__grpcClients[key] = factory()
  }
  return globalStore.__grpcClients[key] as T
}

const insecure = grpc.credentials.createInsecure()

// IAM service clients
export function getAuthClient() {
  return getOrCreate("auth", () =>
    createServiceClient(AuthServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

export function getUserClient() {
  return getOrCreate("user", () =>
    createServiceClient(UserServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

export function getMenuClient() {
  return getOrCreate("menu", () =>
    createServiceClient(MenuServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

export function getRoleClient() {
  return getOrCreate("role", () =>
    createServiceClient(RoleServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

export function getPermissionClient() {
  return getOrCreate("permission", () =>
    createServiceClient(PermissionServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

export function getSessionClient() {
  return getOrCreate("session", () =>
    createServiceClient(SessionServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

export function getAuditClient() {
  return getOrCreate("audit", () =>
    createServiceClient(AuditServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

export function getCompanyClient() {
  return getOrCreate("company", () =>
    createServiceClient(CompanyServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

export function getDivisionClient() {
  return getOrCreate("division", () =>
    createServiceClient(DivisionServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

export function getDepartmentClient() {
  return getOrCreate("department", () =>
    createServiceClient(DepartmentServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

export function getSectionClient() {
  return getOrCreate("section", () =>
    createServiceClient(SectionServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

export function getOrganizationClient() {
  return getOrCreate("organization", () =>
    createServiceClient(OrganizationServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

// Finance service clients
export function getUomClient() {
  return getOrCreate("uom", () =>
    createServiceClient(UOMServiceDefinition, SERVICE_ADDRESSES.finance, insecure, CHANNEL_OPTIONS)
  )
}

export function getRmCategoryClient() {
  return getOrCreate("rmCategory", () =>
    createServiceClient(RMCategoryServiceDefinition, SERVICE_ADDRESSES.finance, insecure, CHANNEL_OPTIONS)
  )
}

export function getParameterClient() {
  return getOrCreate("parameter", () =>
    createServiceClient(ParameterServiceDefinition, SERVICE_ADDRESSES.finance, insecure, CHANNEL_OPTIONS)
  )
}

// CMS service clients (IAM service)
export function getCmsPageClient() {
  return getOrCreate("cmsPage", () =>
    createServiceClient(CMSPageServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

export function getCmsSectionClient() {
  return getOrCreate("cmsSection", () =>
    createServiceClient(CMSSectionServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}

export function getCmsSettingClient() {
  return getOrCreate("cmsSetting", () =>
    createServiceClient(CMSSettingServiceDefinition, SERVICE_ADDRESSES.iam, insecure, CHANNEL_OPTIONS)
  )
}
