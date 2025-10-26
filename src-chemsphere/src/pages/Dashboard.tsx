import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import type { Chemical } from '../utils/storage'
import { getAllChemicals } from '../utils/storage'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

function daysUntil(dateStr?: string) {
  if (!dateStr) return Infinity
  const d = new Date(dateStr)
  const diff = d.getTime() - Date.now()
  return Math.ceil(diff / (24*3600*1000))
}

export default function Dashboard() {
  const [chems, setChems] = useState<Chemical[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const all = await getAllChemicals()
      if (mounted) setChems(all)
    })()
    const onStorage = async () => {
      const all = await getAllChemicals()
      if (mounted) setChems(all)
    }
    window.addEventListener('storage', onStorage)
    return () => { mounted = false; window.removeEventListener('storage', onStorage) }
  }, [])

  const nearExpiration = useMemo(() =>
    chems.filter(c => {
      const days = daysUntil(c.expirationDate)
      return days >= 0 && days <= 90
    }).sort((a,b)=> Number(new Date(a.expirationDate || '')) - Number(new Date(b.expirationDate || '')))
  , [chems])

  const expired = useMemo(() => chems.filter(c => daysUntil(c.expirationDate) < 0), [chems])

  const lowStock = useMemo(() => chems.filter(c => c.currentQuantity <= (c.initialQuantity*0.5)).sort((a,b)=>a.currentQuantity-b.currentQuantity), [chems])

  const outOfStock = useMemo(() => chems.filter(c => c.currentQuantity <= 0), [chems])

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page">
        <h1 className="h3 fw-bold">Dashboard</h1>
        <div className="row g-3 mt-4">
          <div className="col-12 col-md-3">
            <Card>
              <h6 className="mb-2">Near Expiration</h6>
              {nearExpiration.length===0 ? <div className="small text-muted">No items</div> : (
                <ul className="list-unstyled mt-2 mb-0">
                  {nearExpiration.map(c=> <li key={c.id} className="d-flex justify-content-between"><span>{c.name}</span><span className="small text-muted">{c.expirationDate}</span></li>)}
                </ul>
              )}
            </Card>
          </div>
          <div className="col-12 col-md-3">
            <Card>
              <h6 className="mb-2">Low Stock</h6>
              {lowStock.length===0 ? <div className="small text-muted">No items</div> : (
                <ul className="list-unstyled mt-2 mb-0">
                  {lowStock.map(c=> <li key={c.id} className="d-flex justify-content-between"><span>{c.name}</span><Badge>{c.currentQuantity}</Badge></li>)}
                </ul>
              )}
            </Card>
          </div>
          <div className="col-12 col-md-3">
            <Card>
              <h6 className="mb-2">Expired</h6>
              {expired.length===0 ? <div className="small text-muted">No items</div> : (
                <ul className="list-unstyled mt-2 mb-0">
                  {expired.map(c=> <li key={c.id} className="d-flex justify-content-between"><span>{c.name}</span><span className="small text-muted">{c.expirationDate}</span></li>)}
                </ul>
              )}
            </Card>
          </div>
          <div className="col-12 col-md-3">
            <Card>
              <h6 className="mb-2">Out of Stock</h6>
              {outOfStock.length===0 ? <div className="small text-muted">No items</div> : (
                <ul className="list-unstyled mt-2 mb-0">
                  {outOfStock.map(c=> <li key={c.id}>{c.name}</li>)}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
