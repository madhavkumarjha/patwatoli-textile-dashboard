'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ShirtIcon, LogOutIcon, FileTextIcon, BookOpenIcon, PackageIcon } from 'lucide-react'

import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MetricCards } from '@/components/metric-cards'
import { NewBillForm } from '@/components/new-bill/new-bill-form'
import { LedgerTab } from '@/components/ledger/ledger-tab'
import { ItemCatalog } from '@/components/items/item-catalog'

export function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const pathname = usePathname()
  const router = useRouter()
  const section = pathname.endsWith('/items') ? 'items' : pathname.endsWith('/ledger') ? 'ledger' : 'new-bill'

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShirtIcon className="size-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold sm:text-base">
                पटवाटोली टेक्सटाइल
              </span>
              <span className="text-xs text-muted-foreground">
                Billing &amp; खाता बही
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              नमस्ते, <span className="font-medium text-foreground">{user}</span>
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOutIcon data-icon="inline-start" />
              <span className="hidden sm:inline">लॉगआउट</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex flex-col gap-1"
        >
          <h1 className="text-lg font-semibold text-balance sm:text-xl">
            डैशबोर्ड (Dashboard)
          </h1>
          <p className="text-sm text-muted-foreground text-pretty">
            आज का हिसाब, नए बिल और व्यापारियों की उधारी — सब एक जगह।
          </p>
        </motion.div>

        <div className="mb-6">
          <MetricCards />
        </div>

        <Tabs defaultValue={section} className="gap-4">
          <TabsList className="h-9 w-full max-w-lg">
            <TabsTrigger value="new-bill" onClick={() => router.push('/dashboard') }>
              <FileTextIcon data-icon="inline-start" />नया बिल
            </TabsTrigger>
            <TabsTrigger value="ledger" onClick={() => router.push('/dashboard/ledger')}>
              <BookOpenIcon data-icon="inline-start" />खाता बही
            </TabsTrigger>
            <TabsTrigger value="items" onClick={() => router.push('/dashboard/items')}>
              <PackageIcon data-icon="inline-start" />आइटम
            </TabsTrigger>
          </TabsList>
          <TabsContent value="new-bill"><NewBillForm /></TabsContent>
          <TabsContent value="ledger"><LedgerTab /></TabsContent>
          <TabsContent value="items"><ItemCatalog /></TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
