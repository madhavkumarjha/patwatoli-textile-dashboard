'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AINDI_SIZES, AINDI_UNIT, PITAMARI_SIZES, PITAMARI_STYLES, PITAMARI_UNIT } from './types'
import type { Bill, CatalogItem, Merchant, Payment } from './types'

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}

/* ---------------------------------- Auth ---------------------------------- */

interface AuthState {
  isAuthenticated: boolean
  user: string | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

// Demo credentials for the family. Local-only gate (no backend yet).
const DEMO_USER = 'patwatoli'
const DEMO_PASS = 'textile123'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (username, password) => {
        if (
          username.trim().toLowerCase() === DEMO_USER &&
          password === DEMO_PASS
        ) {
          set({ isAuthenticated: true, user: username.trim() })
          return true
        }
        return false
      },
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    { name: 'patwatoli-auth' },
  ),
)

/* ---------------------------------- Data ---------------------------------- */

interface DataState {
  merchants: Merchant[]
  bills: Bill[]
  payments: Payment[]
  catalogItems: CatalogItem[]
  addMerchant: (m: Omit<Merchant, 'id' | 'createdAt'>) => Merchant
  addBill: (b: Omit<Bill, 'id'>) => Bill
  addPayment: (p: Omit<Payment, 'id'>) => Payment
  addCatalogItem: (item: Omit<CatalogItem, 'id' | 'createdAt'>) => CatalogItem
  updateCatalogItem: (id: string, item: Partial<Omit<CatalogItem, 'id' | 'createdAt'>>) => void
  deleteCatalogItem: (id: string) => void
}

const now = new Date()
function daysAgo(n: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const seedMerchants: Merchant[] = [
  {
    id: 'm_rajesh',
    name: 'राजेश वस्त्र भंडार',
    address: 'मेन रोड, पटवाटोली, गया',
    shippingAddress: 'मेन रोड, पटवाटोली, गया',
    gstNumber: '10ABCDE1234F1Z5',
    phone: '9876543210',
    createdAt: daysAgo(120),
  },
  {
    id: 'm_sharma',
    name: 'शर्मा टेक्सटाइल्स',
    address: 'स्टेशन रोड, मानपुर',
    shippingAddress: 'गोदाम नं. 4, मानपुर',
    gstNumber: '10FGHIJ5678K2Z9',
    phone: '9123456780',
    createdAt: daysAgo(90),
  },
  {
    id: 'm_gupta',
    name: 'गुप्ता क्लॉथ हाउस',
    address: 'बड़ा बाज़ार, गया',
    shippingAddress: 'बड़ा बाज़ार, गया',
    gstNumber: '',
    phone: '9988776655',
    createdAt: daysAgo(40),
  },
]

const seedBills: Bill[] = [
  {
    id: 'b_1001',
    merchantId: 'm_rajesh',
    invoiceNumber: 'PT-1001',
    date: daysAgo(60),
    items: [
      {
        id: 'i1',
        product: 'पीतामरी',
        style: 'बंगला',
        size: 'AA',
        unit: 'चौका',
        quantity: 40,
        rate: 850,
      },
      {
        id: 'i2',
        product: 'ऐंडी - चद्दर',
        size: 'बड़ा',
        unit: 'जोड़ा',
        quantity: 20,
        rate: 1200,
      },
    ],
  },
  {
    id: 'b_1002',
    merchantId: 'm_rajesh',
    invoiceNumber: 'PT-1002',
    date: daysAgo(25),
    items: [
      {
        id: 'i3',
        product: 'पीतामरी',
        style: 'हिंदी',
        size: 'AAA',
        unit: 'चौका',
        quantity: 30,
        rate: 900,
      },
    ],
  },
  {
    id: 'b_1003',
    merchantId: 'm_sharma',
    invoiceNumber: 'PT-1003',
    date: daysAgo(18),
    items: [
      {
        id: 'i4',
        product: 'ऐंडी - चद्दर',
        size: 'छोटा',
        unit: 'जोड़ा',
        quantity: 50,
        rate: 700,
      },
    ],
  },
]

const seedCatalogItems: CatalogItem[] = [
  { id: 'c_pitamari', name: 'पीतामरी', defaultUnit: PITAMARI_UNIT, defaultRate: 850, sizes: [...PITAMARI_SIZES], styles: [...PITAMARI_STYLES], createdAt: daysAgo(120) },
  { id: 'c_aindi', name: 'ऐंडी - चद्दर', defaultUnit: AINDI_UNIT, defaultRate: 700, sizes: [...AINDI_SIZES], createdAt: daysAgo(120) },
]

const seedPayments: Payment[] = [
  {
    id: 'p_1',
    merchantId: 'm_rajesh',
    date: daysAgo(55),
    amount: 40000,
    mode: 'बैंक (Bank)',
    type: 'payment',
  },
  {
    id: 'p_2',
    merchantId: 'm_sharma',
    date: daysAgo(30),
    amount: 25000,
    mode: 'UPI',
    type: 'advance',
    adjusted: false,
    note: 'माल भेजने से पहले एडवांस',
  },
  {
    id: 'p_3',
    merchantId: 'm_gupta',
    date: daysAgo(10),
    amount: 15000,
    mode: 'नकद (Cash)',
    type: 'advance',
    adjusted: false,
    note: 'ऑर्डर बुकिंग एडवांस',
  },
]

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      merchants: seedMerchants,
      bills: seedBills,
      payments: seedPayments,
      catalogItems: seedCatalogItems,
      addMerchant: (m) => {
        const merchant: Merchant = {
          ...m,
          id: uid('m'),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ merchants: [...s.merchants, merchant] }))
        return merchant
      },
      addBill: (b) => {
        const bill: Bill = { ...b, id: uid('b') }
        set((s) => ({ bills: [...s.bills, bill] }))
        return bill
      },
      addPayment: (p) => {
        const payment: Payment = { ...p, id: uid('p') }
        set((s) => ({ payments: [...s.payments, payment] }))
        return payment
      },
      addCatalogItem: (item) => {
        const created: CatalogItem = { ...item, id: uid('catalog'), createdAt: new Date().toISOString() }
        set((s) => ({ catalogItems: [...s.catalogItems, created] }))
        return created
      },
      updateCatalogItem: (id, item) => set((s) => ({ catalogItems: s.catalogItems.map((current) => current.id === id ? { ...current, ...item } : current) })),
      deleteCatalogItem: (id) => set((s) => ({ catalogItems: s.catalogItems.filter((item) => item.id !== id) })),
    }),
    { name: 'patwatoli-data', version: 1 },
  ),
)
