import { createContext, useEffect, useState } from 'react'

type User = {
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  isAdmin: boolean
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((s: string) => s.trim())
  .filter((s: string) => !!s)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null') } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    // If you provide a Google Client ID, you can wire google identity here.
    // For now we support a manual/mock signin fallback below in signIn().
  }, [])

  const signIn = async () => {
    setLoading(true)
    // If GOOGLE_CLIENT_ID is set we could call the Google Identity Services flow.
    if (!GOOGLE_CLIENT_ID) {
      // simple prompt fallback for local dev
      const email = window.prompt('Enter email to sign in (local dev)') || ''
      const name = email.split('@')[0] || 'User'
      const u = { name, email }
      setUser(u)
      localStorage.setItem('auth_user', JSON.stringify(u))
      setLoading(false)
      return
    }

    // If you want to wire Google client, implement here using their client library.
    setLoading(false)
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email)

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading, isAdmin }}>{children}</AuthContext.Provider>
  )
}

export default AuthContext
