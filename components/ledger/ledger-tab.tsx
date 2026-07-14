'use client'

import { useMemo, useState } from 'react'
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  BuildingIcon,
  HandCoinsIcon,
  PhoneIcon,
  ReceiptIcon,
  WalletIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useDataStore } from '@/lib/store'
import {
  billTotals,
  buildLedger,
  formatDate,
  formatINR,
  outstandingBalance,
} from '@/lib/calc'
import { cn } from '@/lib/utils'
import { RecordPaymentDialog } from './record-payment-dialog'

export function LedgerTab() {
  const merchants = useDataStore((s) => s.merchants)
  const bills = useDataStore((s) => s.bills)
  const payments = useDataStore((s) => s.payments)
  const [selectedId, setSelectedId] = useState<string | null>(
    merchants[0]?.id ?? null,
  )

  const selected = merchants.find((m) => m.id === selectedId) ?? null

  const merchantSummaries = useMemo(() => {
    return merchants.map((m) => {
      const mb = bills.filter((b) => b.merchantId === m.id)
      const mp = payments.filter((p) => p.merchantId === m.id)
      return {
        merchant: m,
        balance: outstandingBalance(mb, mp),
        billCount: mb.length,
      }
    })
  }, [merchants, bills, payments])

  const detail = useMemo(() => {
    if (!selected) return null
    const mb = bills.filter((b) => b.merchantId === selected.id)
    const mp = payments.filter((p) => p.merchantId === selected.id)
    const ledger = buildLedger(mb, mp)
    const billed = mb.reduce((s, b) => s + billTotals(b.items).total, 0)
    const received = mp.reduce((s, p) => s + p.amount, 0)
    const advances = mp
      .filter((p) => p.type === 'advance' && !p.adjusted)
      .reduce((s, p) => s + p.amount, 0)
    return {
      ledger: ledger.slice().reverse(),
      billed,
      received,
      advances,
      balance: billed - received,
    }
  }, [selected, bills, payments])

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Merchant list */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">व्यापारी / Merchants</CardTitle>
          <CardDescription>खाता देखने के लिए चुनें</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          {merchantSummaries.map(({ merchant, balance, billCount }) => {
            const active = merchant.id === selectedId
            return (
              <button
                key={merchant.id}
                type="button"
                onClick={() => setSelectedId(merchant.id)}
                className={cn(
                  'flex flex-col gap-1 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors',
                  active
                    ? 'border-border bg-accent'
                    : 'hover:bg-muted',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium leading-tight text-pretty">
                    {merchant.name}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">
                    {billCount} बिल
                  </span>
                  <Badge
                    variant={balance > 0 ? 'secondary' : 'outline'}
                    className={cn(
                      'tabular-nums font-mono',
                      balance > 0 && 'text-warning-foreground',
                    )}
                  >
                    {formatINR(balance)}
                  </Badge>
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>

      {/* Detail */}
      {selected && detail ? (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-xl text-balance">
                    {selected.name}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {selected.address ? (
                      <span className="inline-flex items-center gap-1">
                        <BuildingIcon className="size-3.5" />
                        {selected.address}
                      </span>
                    ) : null}
                    {selected.phone ? (
                      <span className="inline-flex items-center gap-1">
                        <PhoneIcon className="size-3.5" />
                        {selected.phone}
                      </span>
                    ) : null}
                  </CardDescription>
                  {selected.gstNumber ? (
                    <span className="font-mono text-xs text-muted-foreground">
                      GSTIN: {selected.gstNumber}
                    </span>
                  ) : null}
                </div>
                <RecordPaymentDialog merchant={selected}>
                  <DialogTrigger
                    render={
                      <Button>
                        <HandCoinsIcon data-icon="inline-start" />
                        भुगतान दर्ज करें
                      </Button>
                    }
                  />
                </RecordPaymentDialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <SummaryStat
                  label="कुल बिल"
                  value={formatINR(detail.billed)}
                  icon={<ReceiptIcon className="size-4" />}
                />
                <SummaryStat
                  label="प्राप्त राशि"
                  value={formatINR(detail.received)}
                  icon={<ArrowDownLeftIcon className="size-4 text-success" />}
                />
                <SummaryStat
                  label="एडवांस (बकाया)"
                  value={formatINR(detail.advances)}
                  icon={<WalletIcon className="size-4 text-primary" />}
                />
                <SummaryStat
                  label="शेष राशि"
                  value={formatINR(detail.balance)}
                  emphasis={detail.balance > 0 ? 'warning' : 'success'}
                  icon={<ArrowUpRightIcon className="size-4" />}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                खाता बही / Ledger
              </CardTitle>
              <CardDescription>
                समयानुसार लेन-देन एवं चालू शेष
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>दिनांक</TableHead>
                      <TableHead>विवरण</TableHead>
                      <TableHead className="text-right">बिल (डेबिट)</TableHead>
                      <TableHead className="text-right">जमा (क्रेडिट)</TableHead>
                      <TableHead className="text-right">शेष</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.ledger.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(row.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                row.kind === 'bill' ? 'outline' : 'secondary'
                              }
                            >
                              {row.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {row.reference}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {row.debit ? formatINR(row.debit) : '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-success">
                          {row.credit ? formatINR(row.credit) : '—'}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-mono font-medium tabular-nums',
                            row.balance > 0
                              ? 'text-warning-foreground'
                              : 'text-muted-foreground',
                          )}
                        >
                          {formatINR(row.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WalletIcon />
            </EmptyMedia>
            <EmptyTitle>कोई व्यापारी नहीं चुना गया</EmptyTitle>
            <EmptyDescription>
              खाता बही देखने के लिए बाईं ओर से एक व्यापारी चुनें।
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}

function SummaryStat({
  label,
  value,
  icon,
  emphasis,
}: {
  label: string
  value: string
  icon: React.ReactNode
  emphasis?: 'warning' | 'success'
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-muted/40 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span className="text-pretty">{label}</span>
      </div>
      <span
        className={cn(
          'font-mono text-lg font-semibold tabular-nums',
          emphasis === 'warning' && 'text-warning-foreground',
          emphasis === 'success' && 'text-success',
        )}
      >
        {value}
      </span>
    </div>
  )
}
