'use client'

import { motion } from 'motion/react'
import {
  TrendingUpIcon,
  WalletIcon,
  HandCoinsIcon,
  type LucideIcon,
} from 'lucide-react'

import { useDataStore } from '@/lib/store'
import { billTotals, formatINR } from '@/lib/calc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Metric {
  key: string
  hi: string
  en: string
  value: number
  icon: LucideIcon
  accent: string
  iconBg: string
}

export function MetricCards() {
  const bills = useDataStore((s) => s.bills)
  const payments = useDataStore((s) => s.payments)

  const now = new Date()
  const monthTaxable = bills
    .filter((b) => {
      const d = new Date(b.date)
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      )
    })
    .reduce((sum, b) => sum + billTotals(b.items).taxable, 0)

  const totalBilled = bills.reduce((s, b) => s + billTotals(b.items).total, 0)
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)
  const outstanding = totalBilled - totalPaid

  const totalAdvance = payments
    .filter((p) => p.type === 'advance' && !p.adjusted)
    .reduce((s, p) => s + p.amount, 0)

  const metrics: Metric[] = [
    {
      key: 'taxable',
      hi: 'इस महीने का टैक्सेबल',
      en: "This Month's Taxable Income",
      value: monthTaxable,
      icon: TrendingUpIcon,
      accent: 'text-primary',
      iconBg: 'bg-primary/10 text-primary',
    },
    {
      key: 'outstanding',
      hi: 'मार्केट उधारी (बकाया)',
      en: 'Total Outstanding Market Credit',
      value: outstanding,
      icon: WalletIcon,
      accent: 'text-warning-foreground',
      iconBg: 'bg-warning/20 text-warning-foreground',
    },
    {
      key: 'advance',
      hi: 'एडवांस पेमेंट',
      en: 'Total Advance Received',
      value: totalAdvance,
      icon: HandCoinsIcon,
      accent: 'text-success',
      iconBg: 'bg-success/12 text-success',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m, i) => (
        <motion.div
          key={m.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06, ease: 'easeOut' }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <CardTitle className="text-sm font-medium text-foreground">
                    {m.hi}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{m.en}</p>
                </div>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${m.iconBg}`}
                >
                  <m.icon className="size-4.5" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p
                className={`font-mono text-2xl font-semibold tracking-tight tabular-nums ${m.accent}`}
              >
                {formatINR(m.value)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
