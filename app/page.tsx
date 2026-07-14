'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { LoginScreen } from '@/components/login-screen'
import { Dashboard } from '@/components/dashboard'
import { Spinner } from '@/components/ui/spinner'

export default function Page() {
  const [mounted, setMounted] = useState(false)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return isAuthenticated ? <Dashboard /> : <LoginScreen />
}
