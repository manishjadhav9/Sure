export type Issuer = 'HDFC' | 'ICICI' | 'SBI' | 'AXIS' | 'AMEX' | 'UNKNOWN'

export type ParseStatus = 'PARSED' | 'FAILED'

export interface ParsedRecord {
  id: string
  filename: string
  issuer: Issuer
  card_last4: string | null
  card_variant: string | null
  total_balance: number | null
  transaction_count: number | null
  interest_charges: number | null
  top_merchant_category: string | null
  uploaded_at: string
  status: ParseStatus
  error?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
