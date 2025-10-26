export type Chemical = {
  id: string
  name: string
  batchNumber: string
  brand?: string
  physicalState?: { type: 'volume'|'mass', unit: string }
  initialQuantity: number
  currentQuantity: number
  arrivalDate?: string
  expirationDate?: string
  safetyClass?: 'green'|'blue'|'white'|'yellow'|'red'
  location?: string
  ghsSymbol?: string
  dateAdded: string
  created_at?: string
  updated_at?: string
}

const CHEM_KEY = 'chemicals_v1'

import supabase from '../../supabase/client'

// If Supabase is configured, use it; otherwise fall back to localStorage.
export async function getAllChemicals(): Promise<Chemical[]> {
  if (supabase) {
    const { data, error } = await supabase.from('chemicals').select('*')
    if (!error && Array.isArray(data)) {
      return data as Chemical[]
    }
    console.warn('Supabase fetch error, falling back to localStorage', error)
  }

  try {
    const raw = localStorage.getItem(CHEM_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Chemical[]
  } catch (err) {
    console.warn('localStorage parse error', err)
    return []
  }
}

export async function saveAllChemicals(items: Chemical[]) {
  // persist locally first
  try { localStorage.setItem(CHEM_KEY, JSON.stringify(items)) } catch (e) { console.warn('local save failed', e) }

  if (!supabase) return

  try {
    // upsert all items by id (naive approach)
    const { error } = await supabase.from('chemicals').upsert(items, { onConflict: 'id' })
    if (error) console.warn('Supabase upsert error', error)
  } catch (e) {
    console.warn('Supabase upsert threw', e)
  }
}

export async function addChemical(c: Omit<Chemical,'id'|'dateAdded'>): Promise<Chemical> {
  const ts = new Date().toISOString()
  const newItem: Chemical = { ...c, id: String(Date.now()), dateAdded: ts, created_at: ts, updated_at: ts }

  if (supabase) {
  const payload = { ...newItem }
  const { data, error } = await supabase.from('chemicals').insert([payload]).select().single()
    if (!error && data) {
      // store locally as well
      try {
        const local = await getAllChemicals()
        local.push(data as Chemical)
        localStorage.setItem(CHEM_KEY, JSON.stringify(local))
      } catch (e) { console.warn('persist local failed', e) }

      // write audit log
      try {
        await supabase.from('logs').insert([{ action: 'insert', table_name: 'chemicals', record_id: (data as Chemical).id, data: data }])
      } catch (logErr) { console.warn('failed to write supabase log', logErr) }

      return data as Chemical
    }
    console.warn('Supabase insert error, falling back to local', error)
  }

  // fallback local-only
  const all = await getAllChemicals()
  all.push(newItem)
  await saveAllChemicals(all)
  return newItem
}

export async function updateChemical(id: string, patch: Partial<Chemical>): Promise<Chemical | null> {
  const all = await getAllChemicals()
  const idx = all.findIndex(a => a.id === id)
  if (idx === -1) return null
  const updated = { ...all[idx], ...patch, updated_at: new Date().toISOString() }

  if (supabase) {
  const { data, error } = await supabase.from('chemicals').upsert([updated], { onConflict: 'id' }).select().single()
    if (!error && data) {
      // sync local
      const local = await getAllChemicals()
      const i = local.findIndex(x=>x.id===id)
      if (i !== -1) { local[i] = data as Chemical; localStorage.setItem(CHEM_KEY, JSON.stringify(local)) }

      // write audit log
      try {
        await supabase.from('logs').insert([{ action: 'update', table_name: 'chemicals', record_id: (data as Chemical).id, data: data }])
      } catch (logErr) { console.warn('failed to write supabase log', logErr) }

      return data as Chemical
    }
    console.warn('Supabase upsert error', error)
  }

  all[idx] = updated
  await saveAllChemicals(all)
  return updated
}

export async function removeChemical(id: string): Promise<void> {
  if (supabase) {
    // attempt to delete and return the deleted row so we can log it
    const { data, error } = await supabase.from('chemicals').delete().eq('id', id).select().single()
    if (!error) {
      // also remove locally
      const local = (await getAllChemicals()).filter(c => c.id !== id)
      localStorage.setItem(CHEM_KEY, JSON.stringify(local))

      // write audit log (deleted record available in `data`)
      try {
        await supabase.from('logs').insert([{ action: 'delete', table_name: 'chemicals', record_id: id, data }])
      } catch (logErr) { console.warn('failed to write supabase log', logErr) }

      return
    }
    console.warn('Supabase delete error', error)
  }

  const all = (await getAllChemicals()).filter(c => c.id !== id)
  await saveAllChemicals(all)
}

// Subscribe to remote changes. Returns an unsubscribe function.
export function subscribeToChemicals(cb: (payload: unknown)=>void) {
  function storageHandler() {
    // emit full list
    getAllChemicals().then(list => cb({ type: 'sync', data: list } as unknown)).catch((err)=>{ console.warn('subscribe storage handler error', err) })
  }
  window.addEventListener('storage', storageHandler)
  const unsubLocal = () => window.removeEventListener('storage', storageHandler)

  if (supabase) {
    try {
      const channel = supabase.channel('public:chemicals')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chemicals' }, (payload) => {
          cb(payload)
        })
        .subscribe()

      return () => {
        try {
          channel.unsubscribe()
        } catch (e) {
          console.warn('channel unsubscribe failed', e)
        }
        unsubLocal()
      }
    } catch (e) {
      console.warn('subscribeToChemicals supabase subscribe failed', e)
      return unsubLocal
    }
  }

  return unsubLocal
}
