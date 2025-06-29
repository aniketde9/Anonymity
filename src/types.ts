
export interface PoolStats {
  totalValuePooled: number
  anonymitySetSize: number
}

export interface DepositAmount {
  sol: number
  label: string
}

export interface SecretNote {
  secret: string
  leaf: string
  depositAmount: number
  timestamp: number
}

export interface WithdrawRequest {
  secretNote: string
  recipientAddress: string
}
