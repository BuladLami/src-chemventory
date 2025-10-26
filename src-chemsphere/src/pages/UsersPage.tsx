import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

type UserEntry = { id: number; email: string }

export default function UsersPage(){
  const [users, setUsers] = useState<UserEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('app_users')||'[]') as UserEntry[] } catch { return [] }
  })
  const [email, setEmail] = useState('')

  function add(){
    if(!email) return
    const next = [...users, {email, id:Date.now()}]
    setUsers(next)
    localStorage.setItem('app_users', JSON.stringify(next))
    setEmail('')
  }

  function remove(idx:number){
    const next = users.filter((_:UserEntry,i)=>i!==idx)
    setUsers(next)
    localStorage.setItem('app_users', JSON.stringify(next))
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page">
        <h1 className="h3">Users (admin)</h1>
        <div className="mb-3 d-flex gap-2">
          <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="user email" />
          <Button onClick={add}>Add</Button>
        </div>
        <ul className="list-group">
          {users.map((u:UserEntry,idx:number)=> (
            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">{u.email} <Button variant="destructive" onClick={()=>remove(idx)}>Remove</Button></li>
          ))}
        </ul>
      </main>
    </div>
  )
}
