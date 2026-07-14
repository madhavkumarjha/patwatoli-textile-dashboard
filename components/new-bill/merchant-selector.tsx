'use client'

import { useMemo, useState } from 'react'
import {
  SearchIcon,
  ChevronsUpDownIcon,
  CheckIcon,
  UserPlusIcon,
  BuildingIcon,
} from 'lucide-react'

import { useDataStore } from '@/lib/store'
import type { Merchant } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { AddClientDialog } from '@/components/new-bill/add-client-dialog'

interface MerchantSelectorProps {
  value: string | null
  onChange: (merchantId: string) => void
  invalid?: boolean
}

export function MerchantSelector({
  value,
  onChange,
  invalid,
}: MerchantSelectorProps) {
  const merchants = useDataStore((s) => s.merchants)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const selected = merchants.find((m) => m.id === value) ?? null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return merchants
    return merchants.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q) ||
        m.gstNumber?.toLowerCase().includes(q),
    )
  }, [merchants, query])

  function handleCreated(m: Merchant) {
    onChange(m.id)
    setOpen(false)
    setQuery('')
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="lg"
              aria-invalid={invalid}
              className="w-full justify-between font-normal"
            />
          }
        >
          <span className="flex min-w-0 items-center gap-2">
            <BuildingIcon className="size-4 shrink-0 text-muted-foreground" />
            {selected ? (
              <span className="truncate">{selected.name}</span>
            ) : (
              <span className="text-muted-foreground">
                व्यापारी चुनें (Select merchant)
              </span>
            )}
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-(--anchor-width) min-w-72 p-0"
        >
          <div className="border-b p-2">
            <InputGroup>
              <InputGroupInput
                autoFocus
                placeholder="नाम / फ़ोन से खोजें..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length > 0 ? (
              filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChange(m.id)
                    setOpen(false)
                    setQuery('')
                  }}
                  className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent"
                >
                  <CheckIcon
                    className={cn(
                      'mt-0.5 size-4 shrink-0 text-primary',
                      m.id === value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{m.name}</span>
                    {(m.phone || m.gstNumber) && (
                      <span className="truncate text-xs text-muted-foreground">
                        {m.phone}
                        {m.phone && m.gstNumber ? ' · ' : ''}
                        {m.gstNumber}
                      </span>
                    )}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                कोई व्यापारी नहीं मिला
                <br />
                <span className="text-xs">No merchant found</span>
              </p>
            )}
          </div>

          <div className="border-t p-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start text-primary"
              onClick={() => {
                setOpen(false)
                setDialogOpen(true)
              }}
            >
              <UserPlusIcon data-icon="inline-start" />
              {query.trim()
                ? `"${query.trim()}" को नया व्यापारी जोड़ें`
                : 'नया व्यापारी जोड़ें (Add New Client)'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <AddClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultName={query.trim()}
        onCreated={handleCreated}
      />
    </>
  )
}
