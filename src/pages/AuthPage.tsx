import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2>{mode === 'login' ? 'Log In' : 'Create Account'}</h2>
      {mode === 'signup' && (
        <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
      )}
      <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleSubmit}>{mode === 'login' ? 'Log In' : 'Sign Up'}</button>
      <p style={{ fontSize: 14 }}>
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </span>
      </p>
    </div>
  )
}