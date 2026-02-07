// Hooks exports
export { usePermission } from "./use-permission"
export { createCrudHooks } from "./create-crud-hooks"
export { useErrorHandler, formatValidationErrors } from "./use-error-handler"
export { useUrlState, createUrlStateHook } from "./use-url-state"
export { useDebounce, useDebouncedCallback, useDebouncedState } from "./use-debounce"
export type {
  ListResponse,
  EntityResponse,
  DeleteResponse,
  NormalizedListResult,
  CrudParsers,
  CrudMessages,
  CrudHookOptions,
  CrudHooks,
  ServiceScope,
} from "./types"
