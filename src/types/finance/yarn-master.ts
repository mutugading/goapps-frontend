export interface LookupFillValuesResponse {
  numericFills: Record<string, number>
  textFills: Record<string, string>
  displayLabel: string
}

// Map lookup_master_code → BFF list endpoint + field mapping
export const LOOKUP_MASTER_CONFIG: Record<
  string,
  {
    apiPath: string
    codeField: string
    labelField: string
  }
> = {
  MACHINE: { apiPath: "/api/v1/finance/machines", codeField: "machineCode", labelField: "machineName" },
  INTERMINGLING: {
    apiPath: "/api/v1/finance/interminglings",
    codeField: "interminglingCode",
    labelField: "interminglingCode",
  },
  PRODUCT_GRADE: { apiPath: "/api/v1/finance/product-grades", codeField: "pgCode", labelField: "pgName" },
  MB_HEAD: { apiPath: "/api/v1/finance/mb-heads", codeField: "mbhMbCosting", labelField: "mbhMgtName" },
  BOX_BOBBIN_COST: { apiPath: "/api/v1/finance/box-bobbin-costs", codeField: "bbcCode", labelField: "bbcName" },
}
