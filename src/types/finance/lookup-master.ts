export interface LookupMaster {
  lmCode: string
  lmDisplayName: string
  lmApiPath: string
  lmCodeField: string
  lmLabelField: string
  lmIsActive: boolean
  lmTableName: string
}

export interface LookupMasterColumn {
  lmcId: string
  lmcMasterCode: string
  lmcColumnName: string
  lmcDisplayName: string
  lmcDataType: "NUMBER" | "TEXT"
  lmcSortOrder: number
}

export interface RemoveApplicablePreview {
  triggerParamCode: string
  triggerParamName: string
  children: Array<{ paramCode: string; paramName: string; currentValue: string }>
}

export interface TableColumn {
  columnName: string
  dataType: "NUMBER" | "TEXT"
  rawType: string
  ordinalPosition: number
}

export interface MasterOption {
  value: string
  label: string
}

export interface UpdateLookupMasterForm {
  lmCode: string
  lmDisplayName?: string
  lmTableName?: string
  lmIsActive?: boolean
}
