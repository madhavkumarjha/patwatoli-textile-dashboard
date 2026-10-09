export type ProductName = 'पीतामरी' | 'ऐंडी - चद्दर'

export const PRODUCTS: ProductName[] = ['पीतामरी', 'ऐंडी - चद्दर']

// पीतामरी options
export const PITAMARI_STYLES = ['बंगला', 'हिंदी'] as const
export const PITAMARI_SIZES = ['A', 'AA', 'AAA', 'K1', 'K2', 'K3'] as const
export const PITAMARI_UNIT = 'चौका'

// ऐंडी - चद्दर options
export const AINDI_SIZES = ['छोटा', 'बड़ा'] as const
export const AINDI_UNIT = 'जोड़ा'

export interface CatalogItem {
  id: string
  name: ProductName
  description?: string
  defaultUnit: string
  defaultRate: number
  sizes: string[]
  sizeRates: Record<string, number>
  styles?: string[]
  createdAt: string
}

export const GST_RATE = 0.025 // 2.5% CGST + 2.5% SGST

export type PaymentMode = 'नकद (Cash)' | 'UPI' | 'बैंक (Bank)' | 'चेक (Cheque)'

export const PAYMENT_MODES: PaymentMode[] = [
  'नकद (Cash)',
  'UPI',
  'बैंक (Bank)',
  'चेक (Cheque)',
]

export interface Merchant {
  id: string
  name: string
  address?: string
  shippingAddress?: string
  gstNumber?: string
  phone?: string
  createdAt: string
}

export interface BillItem {
  id: string
  product: ProductName
  style?: string
  size: string
  unit: string
  quantity: number
  rate: number
}

export interface Bill {
  id: string
  merchantId: string
  invoiceNumber: string
  date: string
  items: BillItem[]
}

export interface Payment {
  id: string
  merchantId: string
  date: string
  amount: number
  mode: PaymentMode
  /** advance = received before dispatch and not yet adjusted against a bill */
  type: 'advance' | 'payment'
  adjusted?: boolean
  note?: string
}

export interface LedgerEntry {
  id: string
  date: string
  kind: 'bill' | 'payment' | 'advance'
  label: string
  reference: string
  debit: number // bill value (increases what merchant owes)
  credit: number // payment received (decreases what merchant owes)
  balance: number // running balance (positive => merchant owes us)
}
