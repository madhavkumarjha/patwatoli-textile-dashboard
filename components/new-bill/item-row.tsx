'use client'

import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { motion } from 'motion/react'
import { Trash2Icon, PackageIcon } from 'lucide-react'

import {
  PRODUCTS,
  PITAMARI_STYLES,
  PITAMARI_SIZES,
  PITAMARI_UNIT,
  AINDI_SIZES,
  AINDI_UNIT,
} from '@/lib/types'
import { itemTaxable, formatINR } from '@/lib/calc'
import type { BillFormValues } from '@/components/new-bill/new-bill-form'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface ItemRowProps {
  index: number
  onRemove: () => void
  canRemove: boolean
}

export function ItemRow({ index, onRemove, canRemove }: ItemRowProps) {
  const { control, register, setValue, formState } =
    useFormContext<BillFormValues>()

  const product = useWatch({ control, name: `items.${index}.product` })
  const quantity = useWatch({ control, name: `items.${index}.quantity` })
  const rate = useWatch({ control, name: `items.${index}.rate` })

  const errors = formState.errors.items?.[index]

  const isPitamari = product === 'पीतामरी'
  const isAindi = product === 'ऐंडी - चद्दर'

  const sizeOptions = isPitamari
    ? PITAMARI_SIZES
    : isAindi
      ? AINDI_SIZES
      : []
  const unit = isPitamari ? PITAMARI_UNIT : isAindi ? AINDI_UNIT : '—'

  const lineTaxable = itemTaxable({
    quantity: Number(quantity) || 0,
    rate: Number(rate) || 0,
  })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div className="rounded-xl border bg-muted/30 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
              {index + 1}
            </span>
            <PackageIcon className="size-4 text-muted-foreground" />
            <span>आइटम (Item)</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            disabled={!canRemove}
            aria-label="आइटम हटाएं (Remove item)"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-12">
          {/* Product */}
          <Field
            className="col-span-2 lg:col-span-3"
            data-invalid={!!errors?.product}
          >
            <FieldLabel>उत्पाद (Product)</FieldLabel>
            <Controller
              control={control}
              name={`items.${index}.product`}
              render={({ field }) => (
                <Select
                  items={PRODUCTS.map((p) => ({ label: p, value: p }))}
                  value={field.value || null}
                  onValueChange={(val) => {
                    field.onChange(val)
                    // reset dependent fields + lock unit
                    setValue(`items.${index}.style`, '')
                    setValue(`items.${index}.size`, '')
                    setValue(
                      `items.${index}.unit`,
                      val === 'पीतामरी'
                        ? PITAMARI_UNIT
                        : val === 'ऐंडी - चद्दर'
                          ? AINDI_UNIT
                          : '',
                    )
                  }}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={!!errors?.product}
                  >
                    <SelectValue placeholder="उत्पाद चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PRODUCTS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          {/* Style (Pitamari only) */}
          {isPitamari && (
            <Field
              className="col-span-1 lg:col-span-2"
              data-invalid={!!errors?.style}
            >
              <FieldLabel>स्टाइल (Style)</FieldLabel>
              <Controller
                control={control}
                name={`items.${index}.style`}
                render={({ field }) => (
                  <Select
                    items={PITAMARI_STYLES.map((s) => ({
                      label: s,
                      value: s,
                    }))}
                    value={field.value || null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors?.style}
                    >
                      <SelectValue placeholder="चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PITAMARI_STYLES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          )}

          {/* Size */}
          <Field
            className={cn(
              'col-span-1',
              isPitamari ? 'lg:col-span-2' : 'lg:col-span-3',
            )}
            data-invalid={!!errors?.size}
          >
            <FieldLabel>साइज़ (Size)</FieldLabel>
            <Controller
              control={control}
              name={`items.${index}.size`}
              render={({ field }) => (
                <Select
                  items={sizeOptions.map((s) => ({ label: s, value: s }))}
                  value={field.value || null}
                  onValueChange={field.onChange}
                  disabled={!product}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={!!errors?.size}
                  >
                    <SelectValue placeholder={product ? 'चुनें' : '—'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {sizeOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          {/* Unit (locked) */}
          <Field className="col-span-2 lg:col-span-2">
            <FieldLabel>यूनिट (Unit)</FieldLabel>
            <div className="flex h-9 items-center rounded-lg border border-dashed bg-muted/50 px-3 text-sm text-muted-foreground">
              {unit}
            </div>
          </Field>

          {/* Quantity */}
          <Field
            className="col-span-1 lg:col-span-2"
            data-invalid={!!errors?.quantity}
          >
            <FieldLabel>मात्रा (Qty)</FieldLabel>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="0"
              aria-invalid={!!errors?.quantity}
              className="font-mono"
              {...register(`items.${index}.quantity`)}
            />
          </Field>

          {/* Rate */}
          <Field className="col-span-1 lg:col-span-3">
            <FieldLabel>
              रेट (Rate){' '}
              <span className="text-xs font-normal text-muted-foreground">
                वैकल्पिक
              </span>
            </FieldLabel>
            <Input
              type="number"
              min={0}
              inputMode="decimal"
              placeholder="बाद में भी भर सकते हैं"
              className="font-mono"
              {...register(`items.${index}.rate`)}
            />
          </Field>

          {/* Line taxable */}
          <div className="col-span-2 flex items-center justify-between gap-2 lg:col-span-3 lg:flex-col lg:items-end lg:justify-center">
            <span className="text-xs text-muted-foreground">
              टैक्सेबल राशि
            </span>
            <Badge variant="secondary" className="font-mono tabular-nums">
              {formatINR(lineTaxable)}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
