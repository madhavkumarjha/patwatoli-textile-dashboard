'use client'

import { useState } from 'react'
import { PencilIcon, PlusIcon, Trash2Icon, PackageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useDataStore } from '@/lib/store'
import { AINDI_SIZES, AINDI_UNIT, PITAMARI_SIZES, PITAMARI_STYLES, PITAMARI_UNIT, type CatalogItem, type ProductName, PRODUCTS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const UNIT_OPTIONS = [PITAMARI_UNIT, AINDI_UNIT, 'किलो', 'मीटर', 'नग']

const defaults = (name: ProductName): Omit<CatalogItem, 'id' | 'createdAt'> => name === 'पीतामरी'
  ? { name, defaultUnit: PITAMARI_UNIT, defaultRate: 850, sizes: [...PITAMARI_SIZES], styles: [...PITAMARI_STYLES] }
  : { name, defaultUnit: AINDI_UNIT, defaultRate: 700, sizes: [...AINDI_SIZES] }

export function ItemCatalog() {
  const items = useDataStore((s) => s.catalogItems)
  const add = useDataStore((s) => s.addCatalogItem)
  const update = useDataStore((s) => s.updateCatalogItem)
  const remove = useDataStore((s) => s.deleteCatalogItem)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogItem | null>(null)
  const [name, setName] = useState<ProductName>('पीतामरी')
  const [unit, setUnit] = useState(PITAMARI_UNIT)
  const [rate, setRate] = useState('850')
  const [sizes, setSizes] = useState(PITAMARI_SIZES.join(', '))
  const [styles, setStyles] = useState(PITAMARI_STYLES.join(', '))

  function start(item?: CatalogItem) {
    setEditing(item ?? null)
    const value = item ? { ...item } : defaults(name)
    setName(value.name); setUnit(value.defaultUnit); setRate(String(value.defaultRate ?? 0))
    setSizes(value.sizes.join(', ')); setStyles(value.styles?.join(', ') ?? '')
    setOpen(true)
  }

  function selectName(value: ProductName) {
    setName(value)
    if (!editing) {
      const next = defaults(value)
      setUnit(next.defaultUnit); setRate(String(next.defaultRate)); setSizes(next.sizes.join(', ')); setStyles(next.styles?.join(', ') ?? '')
    }
  }

  function save() {
    const payload = { name, defaultUnit: unit.trim(), defaultRate: Number(rate) || 0, sizes: sizes.split(',').map((x) => x.trim()).filter(Boolean), styles: styles.split(',').map((x) => x.trim()).filter(Boolean) }
    if (!payload.defaultUnit || !payload.sizes.length) return toast.error('यूनिट और साइज़ भरें')
    if (editing) update(editing.id, payload); else add(payload)
    setOpen(false); toast.success(editing ? 'आइटम अपडेट हो गया' : 'आइटम जोड़ दिया गया')
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2 text-base"><PackageIcon className="size-4 text-primary" />आइटम मास्टर (Item Master)</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button onClick={() => start()} size="sm"><PlusIcon data-icon="inline-start" />नया आइटम</Button>} />
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'आइटम अपडेट करें' : 'नया आइटम जोड़ें'}</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2"><Label>नाम (Name)</Label><div className="flex gap-2">
                <Select items={PRODUCTS.map((item) => ({ label: item, value: item }))} value={name} onValueChange={(value) => value && selectName(value as ProductName)}>
                  <SelectTrigger className="w-full cursor-pointer"><SelectValue placeholder="उत्पाद चुनें" /></SelectTrigger>
                  <SelectContent><SelectGroup>{PRODUCTS.map((item) => <SelectItem className="cursor-pointer" key={item} value={item}>{item}</SelectItem>)}</SelectGroup></SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" className="shrink-0 cursor-pointer" aria-label="नया नाम जोड़ें" onClick={() => toast.info('नया उत्पाद जोड़ने के लिए उत्पाद सूची अपडेट करें')}><PlusIcon /></Button>
              </div><p className="text-xs text-muted-foreground">हिंदी नाम चुनें; बिल में यही नाम अपने-आप आएगा।</p></div>
              <div className="grid gap-2"><Label>यूनिट (Unit)</Label><Select items={UNIT_OPTIONS.map((item) => ({ label: item, value: item }))} value={unit} onValueChange={(value) => value && setUnit(value)}><SelectTrigger className="w-full cursor-pointer"><SelectValue placeholder="यूनिट चुनें" /></SelectTrigger><SelectContent><SelectGroup>{UNIT_OPTIONS.map((item) => <SelectItem className="cursor-pointer" key={item} value={item}>{item}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
              <div className="grid gap-2"><Label>रेट / कीमत (₹)</Label><Input type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="जैसे 850" /></div>
              <div className="grid gap-2"><Label>साइज़ विकल्प (comma separated)</Label><Input value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="A, AA, AAA" /></div>
              <div className="grid gap-2"><Label>स्टाइल विकल्प (comma separated)</Label><Input value={styles} onChange={(e) => setStyles(e.target.value)} placeholder="बंगला, हिंदी" /></div>
            </div>
            <DialogFooter><Button className="cursor-pointer" onClick={save}>सेव करें</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-3 py-2">आइटम</th><th className="px-3 py-2">यूनिट</th><th className="px-3 py-2 text-right">रेट</th><th className="px-3 py-2">साइज़</th><th className="px-3 py-2">स्टाइल</th><th className="px-3 py-2 text-right">एक्शन</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{item.name}</td><td className="px-3 py-3">{item.defaultUnit}</td><td className="px-3 py-3 text-right font-mono">₹{item.defaultRate ?? 0}</td><td className="px-3 py-3">{item.sizes.join(', ')}</td><td className="px-3 py-3">{item.styles?.join(', ') || '—'}</td><td className="px-3 py-3 text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon-sm" className="cursor-pointer" onClick={() => start(item)} aria-label="आइटम संपादित करें"><PencilIcon /></Button><Button variant="ghost" size="icon-sm" className="cursor-pointer text-destructive" onClick={() => { remove(item.id); toast.success('आइटम हटा दिया गया') }} aria-label="आइटम हटाएं"><Trash2Icon /></Button></div></td></tr>)}</tbody></table></div></CardContent>
    </Card>
  )
}
