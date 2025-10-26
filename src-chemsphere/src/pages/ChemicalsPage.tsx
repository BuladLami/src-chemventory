import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import type { Chemical } from '../utils/storage'
import { getAllChemicals, addChemical, saveAllChemicals, removeChemical, subscribeToChemicals } from '../utils/storage'
import { SAMPLE_CHEMICALS } from '../data/sampleData'
import { downloadCSV, exportCSV, parseCSV } from '../utils/csv'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Dialog from '../components/ui/Dialog'

function safetyClassToBadge(cls?: string) {
  // Map to Bootstrap badge background classes
  switch (cls) {
    case 'green': return 'bg-success text-white'
    case 'blue': return 'bg-primary text-white'
    case 'white': return 'bg-light text-dark'
    case 'yellow': return 'bg-warning text-dark'
    case 'red': return 'bg-danger text-white'
    default: return 'bg-secondary text-white'
  }
}

const normalizeSafety = (s?: string) => {
  const ok = s === 'green' || s === 'blue' || s === 'white' || s === 'yellow' || s === 'red'
  return ok ? (s as Chemical['safetyClass']) : 'green'
}

export default function ChemicalsPage() {
  const [chems, setChems] = useState<Chemical[]>([])

  useEffect(()=>{
    let mounted = true
    ;(async ()=>{
      const existing = await getAllChemicals()
      if (existing.length === 0) {
        await saveAllChemicals(SAMPLE_CHEMICALS)
        if (mounted) setChems(SAMPLE_CHEMICALS)
        return
      }
      if (mounted) setChems(existing)
    })()
    return ()=>{ mounted = false }
  },[])

  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'inventory'|'expired'>('inventory')

  useEffect(()=>{
    const onStorage = async () => {
      const all = await getAllChemicals()
      setChems(all)
    }
    window.addEventListener('storage', onStorage)
    return ()=> window.removeEventListener('storage', onStorage)
  },[])

  useEffect(()=>{
    // subscribe to remote changes (supabase realtime or storage events)
    const unsub = subscribeToChemicals((payload: unknown)=>{
      try {
        const p = payload as { type?: string; data?: unknown; event?: string } | null
        if (p && p.type === 'sync' && Array.isArray(p.data)) {
          setChems(p.data as Chemical[])
          return
        }
        // on postgres changes, just refresh full list
        getAllChemicals().then(list=>setChems(list)).catch((e)=>{ console.warn('refresh after payload failed', e) })
      } catch (e) { console.warn('subscribe handler error', e) }
    })
    return ()=> unsub()
  },[])

  const filtered = useMemo(()=> chems.filter(c => {
    if (tab==='expired') return new Date(c.expirationDate||'') < new Date()
    return true
  }).filter(c => {
    if (!query) return true
    return [c.name, c.batchNumber, c.brand, c.location].join(' ').toLowerCase().includes(query.toLowerCase())
  }), [chems, query, tab])

  function handleExport() {
    const text = exportCSV<Chemical>(filtered)
    downloadCSV(text, `chemicals-${tab}.csv`)
  }

  function handleImport(ev: React.ChangeEvent<HTMLInputElement>){
    const f = ev.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = async () => {
      const txt = String(reader.result || '')
      const rows = parseCSV(txt)
      const mapped = rows.map((r: Record<string,string>): Chemical => ({
        id: String(Date.now()+Math.random()),
        name: r['name'] || r['Name'] || '',
        batchNumber: r['batchNumber'] || r['Batch'] || '',
        brand: r['brand'] || '',
        initialQuantity: Number(r['initialQuantity']||r['Initial']||0),
        currentQuantity: Number(r['currentQuantity']||r['Current']||0),
        arrivalDate: r['arrivalDate']||'',
        expirationDate: r['expirationDate']||'',
        safetyClass: normalizeSafety(r['safetyClass']),
        location: r['location']||'',
        dateAdded: new Date().toISOString()
      }))
      const all = [...chems, ...mapped]
      await saveAllChemicals(all)
      setChems(all)
    }
    reader.readAsText(f)
  }

  const [showAdd, setShowAdd] = useState(false)
  type AddForm = {
    name: string
    batchNumber: string
    brand?: string
    initialQuantity: number
    currentQuantity: number
    safetyClass: Chemical['safetyClass']
    arrivalDate?: string
    expirationDate?: string
    location?: string
  }
  const [form, setForm] = useState<AddForm>({ name:'', batchNumber:'', initialQuantity:0, currentQuantity:0, safetyClass:'green' })

  async function submitAdd(e?:React.FormEvent) {
    e?.preventDefault()
    const created = await addChemical({ ...form })
    setChems(prev=>[...prev, created])
    setShowAdd(false)
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h1 className="h3 fw-bold">Chemicals</h1>
            <div className="small text-muted">{chems.length} chemicals — {chems.filter(c=>c.currentQuantity<=0).length} out of stock</div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button onClick={()=>setShowAdd(true)}>Add Chemical</Button>
            <Input className="me-2" placeholder="Search" value={query} onChange={e=>setQuery(e.target.value)} />
            <Button variant="ghost" onClick={handleExport}>Export CSV</Button>
            <label className="btn btn-light mb-0">
              Import
              <input type="file" accept=".csv" onChange={handleImport} style={{display:'none'}} />
            </label>
          </div>
        </div>

        <div className="mt-4">
          <div className="btn-group" role="group" aria-label="tabs">
            <button type="button" className={`btn ${tab==='inventory' ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={()=>setTab('inventory')}>Inventory</button>
            <button type="button" className={`btn ${tab==='expired' ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={()=>setTab('expired')}>Expired</button>
          </div>
        </div>

        <div className="mt-4 list-group">
          {filtered.map(c => (
            <div key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-medium">{c.name}</div>
                <div className="small text-muted">{c.brand} • Batch: {c.batchNumber}</div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <Badge className={safetyClassToBadge(c.safetyClass)}>{c.safetyClass}</Badge>
                <div className="small">Qty: {c.currentQuantity}</div>
                <div className="small">Exp: {c.expirationDate}</div>
                <Button variant="destructive" onClick={async ()=>{
                  if (!confirm(`Delete ${c.name}? This cannot be undone.`)) return
                  await removeChemical(c.id)
                  setChems(prev => prev.filter(x => x.id !== c.id))
                }}>Delete</Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={showAdd} onClose={()=>setShowAdd(false)}>
          <form onSubmit={submitAdd}>
            <h3 className="h6 mb-3">Add chemical</h3>
            <div className="mb-3">
              <Input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            </div>
            <div className="mb-3">
              <Input placeholder="Batch" value={form.batchNumber} onChange={e=>setForm({...form,batchNumber:e.target.value})} />
            </div>
            <div className="mb-3">
              <Input placeholder="Brand" value={form.brand||''} onChange={e=>setForm({...form,brand:e.target.value})} />
            </div>
            <div className="mb-3 d-flex gap-2">
              <Input type="number" placeholder="Initial qty" value={form.initialQuantity} onChange={e=>setForm({...form,initialQuantity: Number(e.target.value)})} />
              <Input type="number" placeholder="Current qty" value={form.currentQuantity} onChange={e=>setForm({...form,currentQuantity: Number(e.target.value)})} />
            </div>
            <div className="mb-3">
              <select value={form.safetyClass} onChange={e=>setForm({...form,safetyClass: normalizeSafety(e.target.value)})} className="form-select">
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="white">White</option>
                <option value="yellow">Yellow</option>
                <option value="red">Red</option>
              </select>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <Button type="submit">Add</Button>
              <Button variant="ghost" type="button" onClick={()=>setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </Dialog>

      </main>
    </div>
  )
}
