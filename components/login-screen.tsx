'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'motion/react'
import { ShirtIcon, LockIcon, ArrowRightIcon } from 'lucide-react'

import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const schema = z.object({
  username: z.string().min(1, 'यूज़रनेम डालें (Enter username)'),
  password: z.string().min(1, 'पासवर्ड डालें (Enter password)'),
})

type FormValues = z.infer<typeof schema>

export function LoginScreen() {
  const login = useAuthStore((s) => s.login)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

  function onSubmit(values: FormValues) {
    const ok = login(values.username, values.password)
    if (!ok) {
      setError('गलत यूज़रनेम या पासवर्ड (Invalid username or password)')
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <ShirtIcon className="size-7" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-balance">
              पटवाटोली टेक्सटाइल
            </h1>
            <p className="text-sm text-muted-foreground">
              Patwatoli Textile Manufacturing
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="mb-5 flex flex-col gap-1">
            <h2 className="text-base font-semibold">लॉगिन करें (Sign in)</h2>
            <p className="text-sm text-muted-foreground text-pretty">
              बिलिंग और खाता बही देखने के लिए लॉगिन करें।
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.username}>
                <FieldLabel htmlFor="username">
                  यूज़रनेम (Username)
                </FieldLabel>
                <Input
                  id="username"
                  autoComplete="username"
                  placeholder="patwatoli"
                  aria-invalid={!!errors.username}
                  {...register('username')}
                />
                <FieldError errors={errors.username ? [errors.username] : []} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">पासवर्ड (Password)</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                />
                <FieldError errors={errors.password ? [errors.password] : []} />
              </Field>

              {error && (
                <p className="text-sm font-medium text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" disabled={isSubmitting}>
                <LockIcon data-icon="inline-start" />
                लॉगिन (Sign in)
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </FieldGroup>
          </form>
        </div>

        <Alert className="mt-4">
          <AlertTitle>डेमो लॉगिन (Demo login)</AlertTitle>
          <AlertDescription>
            <span>
              Username: <span className="font-mono font-medium">patwatoli</span>
            </span>
            <span>
              Password:{' '}
              <span className="font-mono font-medium">textile123</span>
            </span>
          </AlertDescription>
        </Alert>
      </motion.div>
    </main>
  )
}
