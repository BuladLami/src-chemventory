import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function LoginPage() {
  const { user, signIn } = useAuth()
  const nav = useNavigate()

  return (
    <div style={{maxWidth:420, margin:'4rem auto'}}>
      <h2>Sign in</h2>
      {user ? (
        <div>
          <div>Signed in as {user.email}</div>
          <button onClick={() => nav('/')}>Go to dashboard</button>
        </div>
      ) : (
        <div>
          <p>Please sign in with your Google account.</p>
          <button onClick={async ()=>{ await signIn(); nav('/') }}>Sign in</button>
        </div>
      )}
    </div>
  )
}
