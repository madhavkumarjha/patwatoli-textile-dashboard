import {
  GST_RATE,
  type Bill,
  type BillItem,
  type LedgerEntry,
  type Payment,
} from './types'

export function itemTaxable(item: Pick<BillItem, 'quantity' | 'rate'>): number {
  const qty = Number(item.quantity) || 0
  const rate = Number(item.rate) || 0
  return qty * rate
}

export interface BillTotals {
  taxable: number
  cgst: number
  sgst: number
  total: number
}

export function billTotals(items: Array<Pick<BillItem, 'quantity' | 'rate'>>): BillTotals {
  const taxable = items.reduce((sum, it) => sum + itemTaxable(it), 0)
  const cgst = taxable * GST_RATE
  const sgst = taxable * GST_RATE
  const total = taxable + cgst + sgst
  return { taxable, cgst, sgst, total }
}

export function formatINR(value: number): string {
  const safe = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(safe)
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

/** Build a chronological ledger for a merchant: bills (debit +) vs payments (credit -). */
export function buildLedger(bills: Bill[], payments: Payment[]): LedgerEntry[] {
  const rows: Array<Omit<LedgerEntry, 'balance'>> = []

  for (const bill of bills) {
    const { total } = billTotals(bill.items)
    rows.push({
      id: bill.id,
      date: bill.date,
      kind: 'bill',
      label: 'बिल / Invoice',
      reference: bill.invoiceNumber,
      debit: total,
      credit: 0,
    })
  }

  for (const p of payments) {
    rows.push({
      id: p.id,
      date: p.date,
      kind: p.type === 'advance' ? 'advance' : 'payment',
      label: p.type === 'advance' ? 'एडवांस / Advance' : 'भुगतान / Payment',
      reference: p.mode,
      debit: 0,
      credit: p.amount,
    })
  }

  rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  let balance = 0
  return rows.map((r) => {
    balance += r.debit - r.credit
    return { ...r, balance }
  })
}

export function outstandingBalance(bills: Bill[], payments: Payment[]): number {
  const billed = bills.reduce((s, b) => s + billTotals(b.items).total, 0)
  const paid = payments.reduce((s, p) => s + p.amount, 0)
  return billed - paid
}
