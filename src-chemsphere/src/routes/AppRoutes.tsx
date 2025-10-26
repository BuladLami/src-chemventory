import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import Dashboard from '../pages/Dashboard'
import ChemicalsPage from '../pages/ChemicalsPage'
import EquipmentPage from '../pages/EquipmentPage'
import UsersPage from '../pages/UsersPage'
import ProfilePage from '../pages/ProfilePage'
import { useAuth } from '../context/useAuth'

const Protected: React.FC<{ children: React.ReactNode, adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/chemicals/*" element={<Protected><ChemicalsPage /></Protected>} />
      <Route path="/equipment" element={<Protected><EquipmentPage /></Protected>} />
      <Route path="/users" element={<Protected adminOnly><UsersPage /></Protected>} />
      <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
