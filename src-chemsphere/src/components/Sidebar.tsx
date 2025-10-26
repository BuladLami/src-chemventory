import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Sidebar() {
  const { user, signOut, isAdmin } = useAuth()
  return (
    <aside className="sidebar">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="h5 fw-semibold mb-0">Chemventory</h2>
      </div>
      <div className="mb-3 small text-secondary">
        <div>{user?.name}</div>
        <div className="text-muted small">{user?.email}</div>
      </div>
      <nav className="nav flex-column">
        <NavLink to="/" className={({isActive})=> isActive ? 'nav-link active text-white' : 'nav-link text-secondary'}>Dashboard</NavLink>
        <NavLink to="/chemicals" className={({isActive})=> isActive ? 'nav-link active text-white' : 'nav-link text-secondary'}>Chemicals</NavLink>
        <NavLink to="/equipment" className={({isActive})=> isActive ? 'nav-link active text-white' : 'nav-link text-secondary'}>Equipment</NavLink>
        <NavLink to="/profile" className={({isActive})=> isActive ? 'nav-link active text-white' : 'nav-link text-secondary'}>Profile</NavLink>
        {isAdmin && <NavLink to="/users" className={({isActive})=> isActive ? 'nav-link active text-white' : 'nav-link text-secondary'}>Users</NavLink>}
      </nav>
      <div className="mt-4">
        <button onClick={signOut} className="btn btn-danger w-100">Logout</button>
      </div>
    </aside>
  )
}
