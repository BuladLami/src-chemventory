import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/useAuth'

export default function ProfilePage(){
  const { user } = useAuth()
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page">
        <h1 className="h3">Profile</h1>
        <div className="mb-2"><strong>Name:</strong> {user?.name}</div>
        <div className="mb-2"><strong>Email:</strong> {user?.email}</div>
      </main>
    </div>
  )
}
