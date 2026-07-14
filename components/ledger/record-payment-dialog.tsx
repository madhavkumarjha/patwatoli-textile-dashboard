'use client'

import { useState } from 'react'
import { CheckIcon, HandCoinsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PAYMENT_MODES, type Merchant, type PaymentMode } from '@/lib/types'
import { useDataStore } from '@/lib/store'
import { toast } from 'sonner'

export function RecordPaymentDialog({
  merchant,
  children,
}: {
  merchant: Merchant
  children: React.ReactNode
}) {
  const addPayment = useDataStore((s) => s.addPayment)
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState<PaymentMode>('नकद (Cash)')
  const [type, setType] = useState<'payment' | 'advance'>('payment')
  const [note, setNote] = useState('')

  function reset() {
    setAmount('')
    setMode('नकद (Cash)')
    setType('payment')
    setNote('')
  }

  function handleSave() {
    const value = Number(amount)
    if (!value || value <= 0) {
      toast.error('कृपया सही राशि दर्ज करें')
      return
    }
    addPayment({
      merchantId: merchant.id,
      date: new Date().toISOString(),
      amount: value,
      mode,
      type,
      adjusted: false,
      note: note.trim() || undefined,
    })
    toast.success(
      `${type === 'advance' ? 'एडवांस' : 'भुगतान'} दर्ज किया गया`,
      { description: `${merchant.name}` },
    )
    reset()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      {children}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoinsIcon className="size-5 text-primary" />
            भुगतान दर्ज करें
          </DialogTitle>
          <DialogDescription>{merchant.name}</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel>प्रकार / Type</FieldLabel>
            <ToggleGroup
              value={[type]}
              onValueChange={(v) => {
                const next = (v as string[])[0]
                if (next === 'payment' || next === 'advance') setType(next)
              }}
              className="w-full"
            >
              <ToggleGroupItem value="payment" className="flex-1">
                भुगतान (Payment)
              </ToggleGroupItem>
              <ToggleGroupItem value="advance" className="flex-1">
                एडवांस (Advance)
              </ToggleGroupItem>
            </ToggleGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="pay-amount">राशि / Amount (₹)</FieldLabel>
            <Input
              id="pay-amount"
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>माध्यम / Mode</FieldLabel>
            <Select
              value={mode}
              onValueChange={(v) => setMode(v as PaymentMode)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="pay-note">टिप्पणी / Note</FieldLabel>
            <Input
              id="pay-note"
              placeholder="वैकल्पिक"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline">रद्द करें</Button>}
          />
          <Button onClick={handleSave}>
            <CheckIcon data-icon="inline-start" />
            सहेजें
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
