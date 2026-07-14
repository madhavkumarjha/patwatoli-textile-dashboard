'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UserPlusIcon } from 'lucide-react'

import { useDataStore } from '@/lib/store'
import type { Merchant } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'

const schema = z.object({
  name: z.string().min(1, 'व्यापारी का नाम ज़रूरी है (Name is required)'),
  address: z.string().optional(),
  shippingAddress: z.string().optional(),
  gstNumber: z.string().optional(),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AddClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultName?: string
  onCreated?: (merchant: Merchant) => void
}

export function AddClientDialog({
  open,
  onOpenChange,
  defaultName = '',
  onCreated,
}: AddClientDialogProps) {
  const addMerchant = useDataStore((s) => s.addMerchant)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultName,
      address: '',
      shippingAddress: '',
      gstNumber: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: defaultName,
        address: '',
        shippingAddress: '',
        gstNumber: '',
        phone: '',
      })
    }
  }, [open, defaultName, reset])

  function onSubmit(values: FormValues) {
    const merchant = addMerchant({
      name: values.name.trim(),
      address: values.address?.trim() || undefined,
      shippingAddress: values.shippingAddress?.trim() || undefined,
      gstNumber: values.gstNumber?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
    })
    toast.success('नया व्यापारी जोड़ा गया', {
      description: merchant.name,
    })
    onCreated?.(merchant)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlusIcon className="size-4 text-primary" />
            नया व्यापारी जोड़ें (Add New Client)
          </DialogTitle>
          <DialogDescription>
            व्यापारी की जानकारी भरें। सिर्फ़ नाम ज़रूरी है।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} id="add-client-form" noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">
                नाम (Name) <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="name"
                placeholder="जैसे: राजेश वस्त्र भंडार"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              <FieldError errors={errors.name ? [errors.name] : []} />
            </Field>

            <Field>
              <FieldLabel htmlFor="address">पता (Address)</FieldLabel>
              <Textarea
                id="address"
                rows={2}
                placeholder="बिलिंग पता"
                {...register('address')}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="shippingAddress">
                शिपिंग पता (Shipping Address)
              </FieldLabel>
              <Textarea
                id="shippingAddress"
                rows={2}
                placeholder="माल भेजने का पता"
                {...register('shippingAddress')}
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="gstNumber">
                  GST नंबर (GST Number)
                </FieldLabel>
                <Input
                  id="gstNumber"
                  placeholder="10ABCDE1234F1Z5"
                  className="font-mono uppercase"
                  {...register('gstNumber')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">फ़ोन (Phone)</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="9876543210"
                  {...register('phone')}
                />
              </Field>
            </div>
          </FieldGroup>
        </form>

        <DialogFooter showCloseButton>
          <Button type="submit" form="add-client-form">
            <UserPlusIcon data-icon="inline-start" />
            जोड़ें (Add Client)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
