'use client'

import { useMemo } from 'react'
import {
  useForm,
  useFieldArray,
  FormProvider,
  Controller,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import {
  PlusIcon,
  CalendarIcon,
  ReceiptIcon,
  SaveIcon,
  HashIcon,
} from 'lucide-react'

import { useDataStore } from '@/lib/store'
import { billTotals, formatINR, formatDate } from '@/lib/calc'
import { GST_RATE, type ProductName } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { MerchantSelector } from '@/components/new-bill/merchant-selector'
import { ItemRow } from '@/components/new-bill/item-row'

const itemSchema = z
  .object({
    product: z.string().min(1, 'उत्पाद चुनें (Select product)'),
    style: z.string().optional(),
    size: z.string().min(1, 'साइज़ चुनें (Select size)'),
    unit: z.string(),
    quantity: z.string().min(1, 'मात्रा भरें (Enter quantity)'),
    rate: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.product === 'पीतामरी' && !val.style) {
      ctx.addIssue({
        code: 'custom',
        path: ['style'],
        message: 'स्टाइल चुनें (Select style)',
      })
    }
    const q = Number(val.quantity)
    if (!Number.isFinite(q) || q <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['quantity'],
        message: 'सही मात्रा भरें (Valid qty)',
      })
    }
  })

const schema = z.object({
  merchantId: z.string().min(1, 'व्यापारी चुनें (Select merchant)'),
  invoiceNumber: z.string().min(1, 'इनवॉइस नंबर भरें (Enter invoice no.)'),
  date: z.date(),
  items: z.array(itemSchema).min(1, 'कम से कम एक आइटम जोड़ें'),
})

export type BillFormValues = z.infer<typeof schema>

function emptyItem(): BillFormValues['items'][number] {
  return { product: '', style: '', size: '', unit: '', quantity: '', rate: '' }
}

export function NewBillForm() {
  const bills = useDataStore((s) => s.bills)
  const addBill = useDataStore((s) => s.addBill)

  const suggestedInvoice = useMemo(
    () => `PT-${1000 + bills.length + 1}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const methods = useForm<BillFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      merchantId: '',
      invoiceNumber: suggestedInvoice,
      date: new Date(),
      items: [emptyItem()],
    },
    mode: 'onSubmit',
  })

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = methods

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = watch('items')
  const totals = billTotals(
    (watchedItems ?? []).map((it) => ({
      quantity: Number(it?.quantity) || 0,
      rate: Number(it?.rate) || 0,
    })),
  )

  function onSubmit(values: BillFormValues) {
    const bill = addBill({
      merchantId: values.merchantId,
      invoiceNumber: values.invoiceNumber.trim(),
      date: values.date.toISOString(),
      items: values.items.map((it, i) => ({
        id: `it_${Date.now()}_${i}`,
        product: it.product as ProductName,
        style: it.style || undefined,
        size: it.size,
        unit: it.unit,
        quantity: Number(it.quantity) || 0,
        rate: Number(it.rate) || 0,
      })),
    })

    toast.success('बिल सेव हो गया (Bill saved)', {
      description: `${bill.invoiceNumber} · ${formatINR(billTotals(bill.items).total)}`,
    })

    reset({
      merchantId: '',
      invoiceNumber: `PT-${1000 + useDataStore.getState().bills.length + 1}`,
      date: new Date(),
      items: [emptyItem()],
    })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: bill details + items */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ReceiptIcon className="size-4 text-primary" />
                  बिल विवरण (Bill Details)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field data-invalid={!!errors.merchantId}>
                    <FieldLabel>व्यापारी (Merchant)</FieldLabel>
                    <Controller
                      control={control}
                      name="merchantId"
                      render={({ field }) => (
                        <MerchantSelector
                          value={field.value || null}
                          onChange={field.onChange}
                          invalid={!!errors.merchantId}
                        />
                      )}
                    />
                    <FieldError
                      errors={errors.merchantId ? [errors.merchantId] : []}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field data-invalid={!!errors.invoiceNumber}>
                      <FieldLabel htmlFor="invoiceNumber">
                        इनवॉइस नंबर (Invoice No.)
                      </FieldLabel>
                      <div className="relative">
                        <HashIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="invoiceNumber"
                          className="pl-8 font-mono"
                          aria-invalid={!!errors.invoiceNumber}
                          {...register('invoiceNumber')}
                        />
                      </div>
                      <FieldError
                        errors={
                          errors.invoiceNumber ? [errors.invoiceNumber] : []
                        }
                      />
                    </Field>

                    <Field data-invalid={!!errors.date}>
                      <FieldLabel>डिलीवरी/इनवॉइस तारीख (Date)</FieldLabel>
                      <Controller
                        control={control}
                        name="date"
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger
                              render={
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-start font-normal"
                                />
                              }
                            >
                              <CalendarIcon
                                data-icon="inline-start"
                                className="text-muted-foreground"
                              />
                              {field.value
                                ? formatDate(field.value.toISOString())
                                : 'तारीख चुनें'}
                            </PopoverTrigger>
                            <PopoverContent
                              align="start"
                              className="w-auto p-2"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(d) => d && field.onChange(d)}
                                autoFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    आइटम (Items)
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append(emptyItem())}
                  >
                    <PlusIcon data-icon="inline-start" />
                    आइटम जोड़ें
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {fields.map((f, index) => (
                      <ItemRow
                        key={f.id}
                        index={index}
                        canRemove={fields.length > 1}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                {typeof errors.items?.message === 'string' && (
                  <p className="mt-2 text-sm text-destructive">
                    {errors.items.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    बिल सारांश (Bill Summary)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.dl layout className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">
                        टैक्सेबल राशि (Taxable)
                      </dt>
                      <dd className="font-mono font-medium tabular-nums">
                        {formatINR(totals.taxable)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">
                        CGST ({(GST_RATE * 100).toFixed(1)}%)
                      </dt>
                      <dd className="font-mono tabular-nums">
                        {formatINR(totals.cgst)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">
                        SGST ({(GST_RATE * 100).toFixed(1)}%)
                      </dt>
                      <dd className="font-mono tabular-nums">
                        {formatINR(totals.sgst)}
                      </dd>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <dt className="text-base font-semibold">
                        कुल राशि (Total)
                      </dt>
                      <dd className="font-mono text-base font-semibold tabular-nums text-primary">
                        {formatINR(totals.total)}
                      </dd>
                    </div>
                  </motion.dl>

                  <Button type="submit" size="lg" className="mt-5 w-full">
                    <SaveIcon data-icon="inline-start" />
                    बिल सेव करें (Save Bill)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
