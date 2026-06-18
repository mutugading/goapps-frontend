export interface LookupMaster {
  lmCode: string
  lmDisplayName: string
  lmApiPath: string
  lmCodeField: string
  lmLabelField: string
  lmIsActive: boolean
}

export interface LookupMasterColumn {
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
